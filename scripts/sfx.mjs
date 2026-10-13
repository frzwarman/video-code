// Generates every sound effect as a WAV in public/sfx. Deterministic: same files every run.
import {mkdirSync, writeFileSync} from 'node:fs';

const RATE = 48000;
const OUT = new URL('../public/sfx/', import.meta.url);

// Seeded noise (mulberry32) so the files never change between runs.
const rng = (seed) => () => {
  seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

const sine = (f, t) => Math.sin(2 * Math.PI * f * t);
const decay = (t, tau) => Math.exp(-t / tau);

// Each sound is (t, noise) → sample, over a length in seconds.
const SOUNDS = {
  tick: [0.06, (t, n) => decay(t, 0.008) * (0.7 * sine(2600, t) + 0.3 * n)],
  tap: [0.12, (t, n) => decay(t, 0.02) * (0.8 * sine(140, t) + 0.35 * n * decay(t, 0.006))],
  ding: [1.0, (t) => decay(t, 0.28) * (0.6 * sine(1320, t) + 0.35 * sine(1980, t)) * Math.min(1, t / 0.003)],
  hit: [0.7, (t, n) => decay(t, 0.18) * sine(90 * Math.exp(-t * 2.2) * (1 + t), t) + 0.25 * n * decay(t, 0.01)],
  snap: [0.08, (t, n) => decay(t, 0.006) * (0.6 * n + 0.5 * sine(1800, t))],
  click: [0.09, (t, n) => (decay(t, 0.004) + (t > 0.035 ? decay(t - 0.035, 0.004) : 0)) * (0.8 * n + 0.3 * sine(3200, t))],
  thud: [0.35, (t) => decay(t, 0.07) * sine(80, t)],
  tone: [1.2, (t) => Math.min(1, t / 0.05) * decay(t, 0.45) * (0.7 * sine(196, t) + 0.2 * sine(392, t))],
  chime: [1.6, (t) => Math.min(1, t / 0.004) * decay(t, 0.45) * (0.5 * sine(880, t) + 0.3 * sine(1320, t) + 0.2 * sine(1760, t))],
};

// Whoosh: noise through a one-pole low-pass whose cutoff sweeps up then down.
const whoosh = () => {
  const len = 0.6 * RATE, out = new Float32Array(len), n = rng(7);
  let y = 0;
  for (let i = 0; i < len; i++) {
    const p = i / len, env = Math.sin(Math.PI * p) ** 2;
    y += (0.02 + 0.25 * env) * (n() * 2 - 1 - y);
    out[i] = y * env * 3;
  }
  return out;
};

const render = ([seconds, fn], seed) => {
  const len = Math.round(seconds * RATE), out = new Float32Array(len), n = rng(seed);
  for (let i = 0; i < len; i++) out[i] = fn(i / RATE, n() * 2 - 1);
  return out;
};

const wav = (samples) => {
  const peak = samples.reduce((m, s) => Math.max(m, Math.abs(s)), 0) || 1;
  const buf = Buffer.alloc(44 + samples.length * 2);
  buf.write('RIFF', 0); buf.writeUInt32LE(36 + samples.length * 2, 4); buf.write('WAVE', 8);
  buf.write('fmt ', 12); buf.writeUInt32LE(16, 16); buf.writeUInt16LE(1, 20); buf.writeUInt16LE(1, 22);
  buf.writeUInt32LE(RATE, 24); buf.writeUInt32LE(RATE * 2, 28); buf.writeUInt16LE(2, 32); buf.writeUInt16LE(16, 34);
  buf.write('data', 36); buf.writeUInt32LE(samples.length * 2, 40);
  samples.forEach((s, i) => buf.writeInt16LE(Math.round((s / peak) * 0.8 * 32767), 44 + i * 2));
  return buf;
};

mkdirSync(OUT, {recursive: true});
Object.entries(SOUNDS).forEach(([name, def], i) => writeFileSync(new URL(`${name}.wav`, OUT), wav(render(def, i + 1))));
writeFileSync(new URL('whoosh.wav', OUT), wav(whoosh()));
console.log('sfx:', [...Object.keys(SOUNDS), 'whoosh'].join(', '));
