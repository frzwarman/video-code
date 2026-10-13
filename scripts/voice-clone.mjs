// Creates a Gemini voice replicated from the recorded voiceover (public/vo.m4a) and a consent clip
// (public/consent.m4a: the speaker reading Google's Indonesian consent sentence, same mic and room).
// Writes the new voice id into arus/voice.json, so `npm run tts` speaks with it from then on.
//   node scripts/voice-clone.mjs [sampleStart] [sampleEnd]   — seconds of vo.m4a to use (10–30 s of clean speech)
import {spawnSync} from 'node:child_process';
import {existsSync, mkdirSync, readFileSync, writeFileSync} from 'node:fs';

const SAMPLE = 'public/vo.m4a';
const CONSENT = 'public/consent.m4a';
const VOICE_JSON = 'arus/voice.json';
const [start = '7.2', end = '35.0'] = process.argv.slice(2);

const dotenv = existsSync('.env') ? Object.fromEntries(readFileSync('.env', 'utf8').split('\n').filter((l) => l.includes('=')).map((l) => [l.slice(0, l.indexOf('=')).trim(), l.slice(l.indexOf('=') + 1).trim()])) : {};
const KEY = process.env.GEMINI_API_KEY ?? dotenv.GEMINI_API_KEY;
if (!KEY) throw new Error('GEMINI_API_KEY is not set (environment or .env).');
if (!existsSync(CONSENT)) throw new Error(`${CONSENT} is missing: record the consent sentence first.`);
if (end - start < 10 || end - start > 30) throw new Error('The sample must be 10–30 s long.');

const run = (cmd, args) => {
  const r = spawnSync(cmd, args, {encoding: 'utf8', maxBuffer: 64e6});
  if (r.status !== 0) throw new Error(`${cmd} ${args.join(' ')}\n${r.stderr}`);
  return r;
};
mkdirSync('.cache', {recursive: true});

// Both clips as the API recommends: 24 kHz mono 16-bit WAV, lightly cleaned of rumble and hiss.
const prep = (input, output, extra = []) =>
  run('ffmpeg', ['-y', '-loglevel', 'error', ...extra, '-i', input, '-af', 'highpass=f=80,afftdn=nr=15:nf=-65:tn=1', '-ar', '24000', '-ac', '1', '-c:a', 'pcm_s16le', output]);
prep(SAMPLE, '.cache/clone-sample.wav', ['-ss', start, '-to', end]);
prep(CONSENT, '.cache/clone-consent.wav');
const b64 = (f) => readFileSync(f).toString('base64');

const voice = JSON.parse(readFileSync(VOICE_JSON, 'utf8'));
const res = await fetch('https://generativelanguage.googleapis.com/v1beta/voices', {
  method: 'POST',
  headers: {'content-type': 'application/json', 'x-goog-api-key': KEY},
  body: JSON.stringify({
    store: true,
    voice: {
      model: voice.engine.model,
      type: 'replicated',
      display_name: 'Arus narrator',
      replicated: {
        source_audio: {mime_type: 'audio/wav', data: b64('.cache/clone-sample.wav')},
        consent_audio: {mime_type: 'audio/wav', data: b64('.cache/clone-consent.wav')},
      },
    },
  }),
});
const j = await res.json();
if (!res.ok || !j.id) throw new Error(`Voice creation failed (${res.status}): ${JSON.stringify(j).slice(0, 600)}`);
writeFileSync('.cache/voice-clone.json', JSON.stringify(j, null, 2));

console.log(`Voice created: ${j.id} (was "${voice.engine.voice}")`);
voice.engine.voice = j.id;
writeFileSync(VOICE_JSON, JSON.stringify(voice, null, 2) + '\n');
console.log(`${VOICE_JSON} now uses it. Next: npm run tts`);
