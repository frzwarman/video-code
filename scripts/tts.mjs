// Generates the voiceover from arus/voice.json: one clip per scene in public/vo/<id>.wav, plus
// public/vo/manifest.json with the exact start/end of every segment, which the scenes cue from.
// Engine: Gemini TTS when GEMINI_API_KEY is set (env or .env); the Mac's Indonesian voice stands in for
// anything Gemini could not do (no key, or the daily quota is spent). Clips and manifest are published together.
import {spawnSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {copyFileSync, existsSync, mkdirSync, readFileSync, unlinkSync, writeFileSync} from 'node:fs';

// `node scripts/tts.mjs <video> [--standin]`: the video is a folder with a voice.json; --standin skips Gemini.
const ARGS = process.argv.slice(2);
const VIDEO = ARGS.find((a) => !a.startsWith('--')) ?? 'arus';
const STANDIN = ARGS.includes('--standin');
const SRC = `${VIDEO}/voice.json`;
const OUT = `public/vo/${VIDEO}`;
const CACHE = '.cache/tts';
const TARGET_LUFS = -14;
const MAX_GROUP_SEGMENTS = 14; // scenes with the same style share one request, up to this many segments (bigger = fewer requests, riskier splits)

const dotenv = existsSync('.env') ? Object.fromEntries(readFileSync('.env', 'utf8').split('\n').filter((l) => l.includes('=')).map((l) => [l.slice(0, l.indexOf('=')).trim(), l.slice(l.indexOf('=') + 1).trim()])) : {};
const KEY = STANDIN ? undefined : (process.env.GEMINI_API_KEY ?? dotenv.GEMINI_API_KEY);

const {engine, defaults, scenes} = JSON.parse(readFileSync(SRC, 'utf8'));
const ENGINE = {model: engine.model, voice: engine.voice};
mkdirSync(OUT, {recursive: true});
mkdirSync(CACHE, {recursive: true});
if (!KEY) console.warn(STANDIN ? 'Stand-in voice requested: every scene gets the macOS voice.' : 'GEMINI_API_KEY not set: every scene gets the macOS stand-in voice.');

const run = (cmd, args) => {
  const r = spawnSync(cmd, args, {encoding: 'utf8', maxBuffer: 64e6});
  if (r.status !== 0) throw new Error(`${cmd} ${args.join(' ')}\n${r.stderr}`);
  return r;
};
const ffmpeg = (args) => run('ffmpeg', ['-y', '-loglevel', 'error', ...args]);
const seconds = (file) => +run('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', file]).stdout;
const hash = (...parts) => createHash('md5').update(JSON.stringify(parts)).digest('hex').slice(0, 12);
const sleep = (s) => new Promise((r) => setTimeout(r, s * 1000));

// Once the API asks us to wait more than a few minutes, that is the daily limit: stop asking until it resets.
let blockedUntil = 0;
class Quota extends Error {}

// Gemini TTS: the text is read verbatim (CAPITALS = emphasis, <long pause> = a pause), the style rides alongside.
async function gemini(text, style, file) {
  if (blockedUntil) throw new Quota();
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${engine.model}:generateContent`;
  const body = {
    contents: [{role: 'user', parts: [{text, speech_metadata: {style}}]}],
    generationConfig: {responseModalities: ['AUDIO'], speechConfig: {voiceConfig: {voice: engine.voice}}},
  };
  for (let attempt = 1; ; attempt++) {
    const res = await fetch(url, {method: 'POST', headers: {'content-type': 'application/json', 'x-goog-api-key': KEY}, body: JSON.stringify(body)});
    if (res.status === 429 || res.status >= 500) {
      const msg = await res.text();
      const wait = +(/retryDelay":\s*"(\d+)s"/.exec(msg)?.[1] ?? 10 * attempt) + 1;
      if (wait > 300 || attempt >= 20) {
        blockedUntil = Date.now() + wait * 1000;
        throw new Quota();
      }
      console.log(`   ${res.status}: waiting ${wait}s`);
      await sleep(wait);
      continue;
    }
    if (!res.ok) throw new Error(`Gemini ${res.status}: ${await res.text()}`);
    const j = await res.json();
    const part = j.candidates?.[0]?.content?.parts?.find((p) => p.inlineData);
    if (!part) throw new Error('No audio in response: ' + JSON.stringify(j).slice(0, 400));
    const bytes = Buffer.from(part.inlineData.data, 'base64');
    const mime = part.inlineData.mimeType ?? '';
    if (/wav/i.test(mime)) {
      writeFileSync(file, bytes);
    } else {
      const rate = /rate=(\d+)/.exec(mime)?.[1] ?? '24000'; // raw 16-bit mono PCM
      writeFileSync(`${file}.pcm`, bytes);
      ffmpeg(['-f', 's16le', '-ar', rate, '-ac', '1', '-i', `${file}.pcm`, file]);
    }
    await sleep(60 / (engine.rpm ?? 3)); // stay under the per-minute quota
    return;
  }
}

function say(text, file) {
  // The Mac voice has its own pause syntax; other tags are dropped.
  run('say', ['-v', 'Damayanti', '-o', `${file}.aiff`, text.replace(/<long pause>/g, '[[slnc 900]]').replace(/<[^>]+>/g, '')]);
  ffmpeg(['-i', `${file}.aiff`, file]);
}

// Silences in a clip, longest first.
const silences = (file, minSeconds) => {
  const log = run('ffmpeg', ['-hide_banner', '-i', file, '-af', `silencedetect=noise=-40dB:d=${minSeconds}`, '-f', 'null', '-']).stderr;
  const starts = [...log.matchAll(/silence_start: ([\d.]+)/g)].map((m) => +m[1]);
  const ends = [...log.matchAll(/silence_end: ([\d.]+)/g)].map((m) => +m[1]);
  return starts.map((start, i) => ({start, end: ends[i] ?? seconds(file)})).sort((p, q) => q.end - q.start - (p.end - p.start));
};

// Cut `raw` into one clip per entry of `files`, at the pauses the model left for the <long pause> tags.
// Which pauses: the text lengths say roughly where each boundary should fall; a small dynamic program
// picks the monotonic set of detected pauses closest to those positions (longer pauses preferred).
const trimHead = 'silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.08';
const trimTail = 'areverse,silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.12,areverse';
function split(raw, files, texts, label) {
  const T = seconds(raw);
  const K = files.length - 1;
  const chars = texts.map((t) => t.replace(/<[^>]+>/g, '').length);
  const total = chars.reduce((a, b) => a + b, 0);
  let acc = 0;
  const expected = chars.slice(0, -1).map((c) => ((acc += c) / total) * T);
  const sil = silences(raw, 0.12).sort((p, q) => p.start - q.start);
  if (sil.length < K) return false;
  const centre = (g) => (g.start + g.end) / 2;
  const cost = (k, m) => Math.abs(centre(sil[m]) - expected[k]) - 0.4 * Math.min(1, sil[m].end - sil[m].start);
  const dp = Array.from({length: K}, () => new Array(sil.length).fill(Infinity));
  const back = Array.from({length: K}, () => new Array(sil.length).fill(-1));
  for (let m = 0; m < sil.length; m++) dp[0][m] = cost(0, m);
  for (let k = 1; k < K; k++) {
    for (let m = k; m < sil.length; m++) {
      for (let j = k - 1; j < m; j++) {
        const c = dp[k - 1][j] + cost(k, m);
        if (c < dp[k][m]) {
          dp[k][m] = c;
          back[k][m] = j;
        }
      }
    }
  }
  const cuts = [0];
  if (K > 0) {
    let m = dp[K - 1].indexOf(Math.min(...dp[K - 1]));
    const chosen = [];
    for (let k = K - 1; k >= 0; k--) {
      chosen.unshift(centre(sil[m]));
      m = back[k][m];
    }
    cuts.push(...chosen);
  }
  cuts.push(T);
  console.log(`   ${label}: cut at ${cuts.slice(1, -1).map((c) => c.toFixed(2)).join(', ')}s`);
  files.forEach((f, i) => ffmpeg(['-ss', String(cuts[i]), '-to', String(cuts[i + 1]), '-i', raw, '-af', `${trimHead},${trimTail}`, '-ar', '48000', '-ac', '1', f]));
  return true;
}

// A split lines up with the text when every clip exists and lasts about as long as its words suggest.
const valid = (files, texts) =>
  files.every((f, i) => {
    if (!existsSync(f)) return false;
    const s = seconds(f);
    // Expected length from the text, with slack so a short line read slowly ("Ini Arus.") still passes.
    const ratio = s / (0.065 * texts[i].replace(/<[^>]+>/g, '').length + 0.35);
    return s >= 0.12 && ratio >= 0.35 && ratio <= 2.2;
  });

// Per-scene plan: segments, style, the full text with pause tags, and the cache files for a given engine.
const plan = scenes.map((scene) => {
  const segs = scene.segments.map((s) => ({pause: defaults.pause, ...(typeof s === 'string' ? {text: s} : s)}));
  const style = scene.style ?? engine.style;
  const text = segs.map((s) => s.text).join(' <long pause> ');
  const clips = (eng) => segs.map((_, i) => `${CACHE}/${hash(eng, style, text)}-${i}.wav`);
  return {scene, segs, style, text, clips};
});

// How a scene's clips get made, in order of preference: one request for a group of same-style scenes
// (best prosody, fewest requests), one request per scene, one request per segment (needs no splitting).
// A level is tried only when the previous one's pauses did not line up with the text.
async function generate(items, level) {
  if (level === 'segment') {
    for (const p of items) {
      const files = p.clips(ENGINE);
      for (let i = 0; i < p.segs.length; i++) {
        const raw = `${CACHE}/${hash(ENGINE, p.style, p.segs[i].text)}.raw.wav`;
        if (!existsSync(raw)) await gemini(p.segs[i].text, p.style, raw);
        ffmpeg(['-i', raw, '-af', `${trimHead},${trimTail}`, '-ar', '48000', '-ac', '1', files[i]]);
      }
      console.log(`   generated ${p.scene.id} (one request per segment)`);
    }
    return;
  }
  for (const batch of level === 'group' ? [items] : items.map((p) => [p])) {
    const ids = batch.map((p) => p.scene.id).join('+');
    const text = batch.map((p) => p.text).join(' <long pause> ');
    const raw = `${CACHE}/${hash(ENGINE, batch[0].style, text)}.raw.wav`;
    if (!existsSync(raw)) await gemini(text, batch[0].style, raw);
    const files = batch.flatMap((p) => p.clips(ENGINE));
    const texts = batch.flatMap((p) => p.segs.map((s) => s.text));
    if (split(raw, files, texts, ids) && valid(files, texts)) {
      console.log(`   generated ${ids}`);
      continue;
    }
    const next = level === 'group' ? 'scene' : 'segment';
    console.warn(`   ${ids}: the pauses did not line up with the text; trying one request per ${next}`);
    files.forEach((f) => existsSync(f) && unlinkSync(f));
    await generate(batch, next);
  }
}

// Gemini, for scenes not yet in the cache: same-style scenes share one request (the free tier is a handful a day).
if (KEY) {
  const groups = [];
  for (const p of plan.filter((p) => !valid(p.clips(ENGINE), p.segs.map((s) => s.text)))) {
    const g = groups[groups.length - 1];
    if (g && g.style === p.style && g.count + p.segs.length <= MAX_GROUP_SEGMENTS) {
      g.items.push(p);
      g.count += p.segs.length;
    } else {
      groups.push({style: p.style, items: [p], count: p.segs.length});
    }
  }
  for (const g of groups) {
    try {
      await generate(g.items, g.items.length > 1 ? 'group' : 'scene');
    } catch (e) {
      if (!(e instanceof Quota)) throw e;
      console.warn(`   quota spent: ${g.items.map((p) => p.scene.id).join(', ')} left for later`);
    }
  }
}

const manifest = {};
const standIns = [];
for (const {scene, segs, text, clips} of plan) {
  const texts = segs.map((s) => s.text);
  let files = clips(ENGINE);
  if (!valid(files, texts)) {
    files = clips('say');
    if (!valid(files, texts)) {
      const raw = `${CACHE}/${hash('say', text)}.raw.wav`;
      say(text, raw);
      if (!split(raw, files, segs.map((s) => s.text), scene.id)) throw new Error(`${scene.id}: the stand-in voice left too few pauses to split.`);
    }
    standIns.push(scene.id);
  }

  // Assemble: clip, pause, clip, pause … (no pause after the last one).
  const inputs = [];
  const labels = [];
  const timing = [];
  let t = 0;
  files.forEach((file, i) => {
    const dur = seconds(file);
    timing.push({text: segs[i].text, start: +t.toFixed(3), end: +(t + dur).toFixed(3)});
    inputs.push('-i', file);
    labels.push(`[${labels.length}:a]`);
    t += dur;
    if (i < files.length - 1) {
      inputs.push('-f', 'lavfi', '-i', `aevalsrc=0:d=${segs[i].pause}:s=48000`);
      labels.push(`[${labels.length}:a]`);
      t += segs[i].pause;
    }
  });
  const joined = `${CACHE}/${VIDEO}-${scene.id}.joined.wav`;
  ffmpeg([...inputs, '-filter_complex', `${labels.join('')}concat=n=${labels.length}:v=0:a=1[a]`, '-map', '[a]', joined]);

  // One constant gain to −14 LUFS, then a true-peak ceiling.
  const log = run('ffmpeg', ['-hide_banner', '-i', joined, '-af', 'loudnorm=print_format=json', '-f', 'null', '-']).stderr;
  const measured = JSON.parse(log.slice(log.lastIndexOf('{'), log.lastIndexOf('}') + 1));
  const gain = (TARGET_LUFS - +measured.input_i).toFixed(2);
  ffmpeg(['-i', joined, '-af', `volume=${gain}dB,alimiter=limit=0.841:attack=2:release=60:level=false`, `${CACHE}/${VIDEO}-${scene.id}.out.wav`]);

  manifest[scene.id] = {
    file: `vo/${VIDEO}/${scene.id}.wav`,
    engine: standIns.includes(scene.id) ? 'stand-in' : engine.model,
    lead: scene.lead ?? defaults.lead,
    tail: scene.tail ?? defaults.tail,
    seconds: +t.toFixed(3),
    segments: timing,
  };
  console.log(`${scene.id.padEnd(4)} ${t.toFixed(2)}s  ${segs.map((s) => s.text).join(' | ')}`);
}

for (const [id, m] of Object.entries(manifest)) {
  if (!(m.seconds > 0) || m.segments.some((s) => !(s.end > s.start))) throw new Error(`${id}: a clip is empty or unreadable; nothing was published.`);
}
// Publish clips and manifest together, so the preview never plays a half-updated set.
for (const {scene} of plan) copyFileSync(`${CACHE}/${VIDEO}-${scene.id}.out.wav`, `${OUT}/${scene.id}.wav`);
writeFileSync(`${OUT}/manifest.json`, JSON.stringify(manifest, null, 2) + '\n');
const total = Object.values(manifest).reduce((a, m) => a + m.lead + m.seconds + m.tail, 0);
console.log(`→ ${OUT}/manifest.json · ${VIDEO} · ${plan.length} scenes · ${total.toFixed(1)}s of film`);
if (standIns.length) {
  const reset = blockedUntil ? ` — Gemini's daily quota resets around ${new Date(blockedUntil).toLocaleString()}` : '';
  console.warn(`Stand-in voice on ${standIns.join(', ')}${reset}. Run \`npm run tts -- ${VIDEO}\` again to fill them in.`);
}
