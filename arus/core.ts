import {Easing, interpolate} from 'remotion';

export const FPS = 60;
export const W = 1080;
export const H = 1920;
// Reels/TikTok UI covers the top 220px and bottom 380px.
export const SAFE = {top: 220, bottom: H - 380};

export const sec = (s: number) => Math.round(s * FPS);

// The app's --ease-swift and --ease-out-back.
export const swift = Easing.bezier(0.22, 1, 0.36, 1);
export const back = Easing.bezier(0.34, 1.56, 0.64, 1);

/** 0 → 1 from frame `start` over `dur` frames, eased and clamped. */
export const prog = (f: number, start: number, dur: number, easing = swift) =>
  interpolate(f, [start, start + dur], [0, 1], {
    easing,
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

export const lerp = (a: number, b: number, p: number) => a + (b - a) * p;

/** 152500 → "Rp 152.500" (Indonesian thousands separator, no Intl dependency). */
export const rupiah = (n: number) =>
  'Rp ' + Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');

/** A sound effect: `at` is a frame inside the scene, `sound` a file in public/sfx. */
export type Cue = {at: number; sound: string; volume?: number};

/** Fade in while rising `dist` px; p is 0 → 1. */
export const fadeUp = (p: number, dist = 30) => ({opacity: p, transform: `translateY(${(1 - p) * dist}px)`});

/** Strong ease-in-out for things that move while on screen (not entering or leaving). */
export const inOut = Easing.bezier(0.77, 0, 0.175, 1);

/** A decaying wobble that starts at frame `at`: ±amp, settled after ~3×decay frames. */
export const kick = (f: number, at: number, amp = 10, decay = 8) =>
  f < at ? 0 : amp * Math.exp(-(f - at) / decay) * Math.cos((f - at) * 1.4);

/** Round to whole thousands, so a counting rupiah figure never shows odd digits. */
export const roundK = (n: number) => Math.round(n / 1000) * 1000;

import manifest from '../public/vo/manifest.json';

/** The voiceover, one clip per scene, written by `npm run tts` from arus/voice.json. */
type Voice = {file: string; lead: number; tail: number; seconds: number; segments: {text: string; start: number; end: number}[]};
export const VOICE = manifest as Record<string, Voice>;

/** Frame (inside scene `id`) where voice segment `seg` starts, moved `frac` of the way through it (1 = its end). */
export const cue = (id: string, seg: number, frac = 0) => {
  const v = VOICE[id];
  const s = v.segments[Math.min(seg, v.segments.length - 1)];
  return Math.round((v.lead + s.start + frac * (s.end - s.start)) * FPS);
};

/** Frame where scene `id`'s voice ends. */
export const voiceEnd = (id: string) => Math.round((VOICE[id].lead + VOICE[id].seconds) * FPS);

/** A camera move: from frame `at`, over `dur` frames, settle at `zoom` looking at (x, y) in scene pixels. */
export type CameraKey = {at: number; zoom: number; x?: number; y?: number; dur?: number};

/** Where the camera is at frame f: keys hold until the next one starts; moves ease in and out. */
export const cameraAt = (keys: CameraKey[] | undefined, f: number) => {
  let state = {zoom: 1, x: W / 2, y: H / 2};
  if (!keys?.length) return state;
  let from = {...state};
  for (const k of [...keys].sort((a, b) => a.at - b.at)) {
    if (f < k.at) break;
    const to = {zoom: k.zoom, x: k.x ?? W / 2, y: k.y ?? H / 2};
    const p = prog(f, k.at, k.dur ?? 30, inOut);
    state = {zoom: lerp(from.zoom, to.zoom, p), x: lerp(from.x, to.x, p), y: lerp(from.y, to.y, p)};
    from = to;
  }
  return state;
};

/** A spin into place: degrees from `from` to 0 over `dur` frames after `at`, eased out. */
export const spin = (f: number, at: number, dur = 24, from = -150) => lerp(from, 0, prog(f, at, dur));
