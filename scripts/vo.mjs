// Cleans and normalises the one-take voiceover: public/vo.m4a → public/vo-loud.wav.
//   1. denoise (profile from the lead-in), gate, and mute every pause ≥ 0.35 s (breaths live there)
//   2. measure, then apply ONE constant gain to land at −14 LUFS — never a pumping dynamic one
import {spawnSync} from 'node:child_process';
import {writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';

const IN = 'public/vo.m4a';
const OUT = 'public/vo-loud.wav';
const TARGET_LUFS = -14;
// Room tone at the start of the take, before the first word: the denoiser's noise profile.
const NOISE = [0.25, 1.75];
// Same silence rule Film.tsx's voice ranges were cut with.
const SILENCE = 'noise=-38dB:d=0.35';

const ffmpeg = (args) => {
  const r = spawnSync('ffmpeg', ['-hide_banner', '-y', '-i', IN, ...args], {encoding: 'utf8', maxBuffer: 64e6});
  if (r.status !== 0) throw new Error(r.stderr);
  return r.stderr;
};

// Pauses between phrases, measured on the raw take (pre-gain, where breaths still sit under the threshold).
const det = ffmpeg(['-af', `silencedetect=${SILENCE}`, '-f', 'null', '-']);
const starts = [...det.matchAll(/silence_start: ([\d.]+)/g)].map((m) => +m[1]);
const ends = [...det.matchAll(/silence_end: ([\d.]+)/g)].map((m) => +m[1]);
// A volume envelope that dips to 0 inside each pause: down 60 ms after the phrase ends, back up
// 50 ms before the next one starts, 50 ms ramps, evaluated every 5 ms so the ramps are smooth.
const F = 0.05;
const dips = starts.map((a, i) => {
  const down = (a + 0.06).toFixed(3);
  const up = ((ends[i] ?? 1e9) - 0.05 - F).toFixed(3);
  return `(clip((t-${down})/${F},0,1)-clip((t-${up})/${F},0,1))`;
});
const mute = `asetnsamples=n=240,volume='1-${dips.join('-')}':eval=frame`;

const cmd = join(tmpdir(), 'arus-noise.cmd');
writeFileSync(cmd, `${NOISE[0]} afftdn sn start;\n${NOISE[1]} afftdn sn stop;\n`);

const clean = [
  'highpass=f=80', // rumble and handling noise
  `asendcmd=f=${cmd}`,
  'afftdn=nr=20:nf=-60:rf=-70', // broadband hiss, profiled from the lead-in
  'agate=threshold=0.005:ratio=2:attack=3:release=250:range=0.25:detection=peak', // room inside a phrase: −12 dB, soft enough to leave consonant onsets alone
  mute,
  'volume=24dB',
  'acompressor=threshold=-12dB:ratio=2.5:attack=5:release=120',
  'alimiter=limit=0.708:attack=2:release=60:level=false', // −3 dB ceiling
].join(',');

const measure = (chain) => {
  const log = ffmpeg(['-af', `${chain},loudnorm=print_format=json`, '-f', 'null', '-']);
  return JSON.parse(log.slice(log.lastIndexOf('{'), log.lastIndexOf('}') + 1));
};

const gain = TARGET_LUFS - +measure(clean).input_i;
const final = `${clean},volume=${gain.toFixed(2)}dB,alimiter=limit=0.841:attack=2:release=60:level=false`; // −1.5 dBTP safety
ffmpeg(['-af', final, '-ar', '48000', OUT]);

const out = measure(final);
console.log(`${OUT}: ${out.input_i} LUFS, true peak ${out.input_tp} dBTP, ${dips.length} pauses muted, gain ${gain.toFixed(2)} dB`);
