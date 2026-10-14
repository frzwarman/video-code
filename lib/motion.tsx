// The motion kit (after Cinetic's motion tokens, references in TREATMENT notes): easing characters, a pulse with a
// real attack, a live camera (log zoom, distance-timed moves, creeping holds, hard punch-ins), the tap, word
// reveals, and how a phone enters a scene. Pure functions of the frame, like everything else.
import {createContext, useContext, type CSSProperties, type ReactNode} from 'react';
import {Easing, useCurrentFrame} from 'remotion';
import {type CameraKey, FPS, H, W, lerp, prog} from './core';
import {C} from './palette';

/** Easing characters. A film mostly uses three: `out` for arrivals, `cam` for the camera, `exit` into cuts. */
export const E = {
  out: Easing.bezier(0.16, 1, 0.3, 1), // arrivals, reveals: fast, then settles
  exit: Easing.bezier(0.55, 0.055, 0.675, 0.19), // leaving into a cut: fastest on the last frame
  smooth: Easing.bezier(0.65, 0, 0.35, 1), // fades, holds
  ui: Easing.bezier(0.4, 0, 0.2, 1), // small UI changes: chips, rows
  cam: Easing.bezier(0.48, 0.1, 0, 0.9), // camera: slow start, early peak, long settle
  glide: Easing.bezier(0.47, 0.2, 0.15, 1), // 150–350 px element moves: sheets
  type: Easing.bezier(0.5, 1, 0.89, 1), // a counting figure
};

/** 0 before `at`; rises on a quarter sine to 1 `attack` frames later, then decays. For lock-ins and payoffs. */
export const hitPulse = (f: number, at: number, attack = 3, decay = 9) => {
  if (f < at) return 0;
  const t = f - at;
  return t < attack ? Math.sin(((t / attack) * Math.PI) / 2) : Math.exp(-(t - attack) / decay);
};

/** 1 at `at`, relaxing to 0: a figure or character that arrives in the accent and settles to ink. */
export const fresh = (f: number, at: number, dur = 16) => (f < at ? 0 : 1 - prog(f, at, dur, E.smooth));
export const accentInk = (amount: number) => (amount > 0.01 ? `color-mix(in oklch, ${C.accentStrong} ${(amount * 100).toFixed(1)}%, ${C.ink})` : C.ink);

// --- Camera ---------------------------------------------------------------------------------------------
type Shot = {zoom: number; x: number; y: number};
/** Focus moves linearly, zoom in log space, so a 1→2 push feels as even as 2→4. */
export const lmix = (a: Shot, b: Shot, p: number): Shot => ({zoom: Math.exp(lerp(Math.log(a.zoom), Math.log(b.zoom), p)), x: lerp(a.x, b.x, p), y: lerp(a.y, b.y, p)});
/** A held shot is never frozen: it creeps in 0.04% a frame, up to +6%; the next move takes it from there. */
const creep = (t: number) => 1 + Math.min(0.06, 0.0004 * Math.max(0, t));
/** Move length from how far the shot travels: 0.35 s + 1.35 ms per px, clamped to 0.6–2.4 s. */
const autoDur = (a: Shot, b: Shot) => {
  const px = Math.hypot(a.x - b.x, a.y - b.y) + Math.abs(Math.log(b.zoom / a.zoom)) * 800;
  return Math.round(Math.min(2.4, Math.max(0.6, 0.35 + 0.00135 * px)) * FPS);
};
type Move = {a: Shot; b: Shot; at: number; dur: number};
const evalMove = (m: Move, t: number): Shot => {
  if (m.dur <= 0 || t >= m.at + m.dur) return {...m.b, zoom: m.b.zoom * creep(t - m.at - m.dur)};
  return lmix(m.a, m.b, prog(t, m.at, m.dur, E.cam));
};
/**
 * The camera at frame f. Each key starts from wherever the camera is at that frame (so keys may come early),
 * eases on E.cam for `dur` frames (or a time set by the distance), then creeps. `cut: true` jumps: a punch-in.
 */
export const shotAt = (keys: CameraKey[] | undefined, f: number): Shot => {
  let m: Move = {a: {zoom: 1, x: W / 2, y: H / 2}, b: {zoom: 1, x: W / 2, y: H / 2}, at: 0, dur: 0};
  for (const k of [...(keys ?? [])].sort((p, q) => p.at - q.at)) {
    if (f < k.at) break;
    const a = evalMove(m, k.at);
    const b = {zoom: k.zoom, x: k.x ?? W / 2, y: k.y ?? H / 2};
    m = {a, b, at: k.at, dur: k.cut ? 0 : (k.dur ?? autoDur(a, b))};
  }
  return evalMove(m, f);
};
/** A punch-in: hard cut to a tight shot of (x, y) at `at`, held `hold` frames, hard cut back to `back`. */
export const punch = (at: number, x: number, y: number, back: Omit<CameraKey, 'at'>, zoom = 2.3, hold = 54): CameraKey[] => [
  {at, zoom, x, y, cut: true},
  {...back, at: at + hold, cut: true},
];

// --- How a scene begins -------------------------------------------------------------------------------------
/** 'through': a scale-through cut, the phone arrives already moving. 'relay': the phone was already here. */
export type Enter = 'first' | 'through' | 'relay';
export const EnterContext = createContext<Enter>('first');
/** The phone's style on entering: slides up 150 px over 44 f on E.out with no fade, or stays put on a relay. */
export const usePhoneIn = (): CSSProperties => {
  const f = useCurrentFrame();
  const enter = useContext(EnterContext);
  return enter === 'relay' ? {} : {transform: `translateY(${(1 - prog(f, 0, 44, E.out)) * 150}px)`};
};

// --- The tap ----------------------------------------------------------------------------------------------
/** The tapped control squishes 5% over 4 f and recoils over 8 f. Use as a transform scale on the control. */
export const pressScale = (f: number, at: number) => {
  const t = f - at;
  if (t < 0 || t > 12) return 1;
  return 1 - 0.05 * (t < 4 ? E.smooth(t / 4) : 1 - E.out((t - 4) / 8));
};
/** A crisp focus ring that hugs a control (scene px, centred on x, y): outset 4 → 14 px, gone in 20 f. */
export const Tap = ({f, at, x, y, w, h, r = 999}: {f: number; at: number; x: number; y: number; w: number; h: number; r?: number}) => {
  const t = f - at;
  if (t < 0 || t > 20) return null;
  const o = lerp(4, 14, prog(f, at, 8, E.out));
  return <div style={{position: 'absolute', left: x - w / 2 - o, top: y - h / 2 - o, width: w + 2 * o, height: h + 2 * o, borderRadius: r === 999 ? 999 : r + o, border: `3px solid ${C.accent}`, boxSizing: 'border-box', opacity: 0.9 * (1 - t / 20)}} />;
};

// --- Words ------------------------------------------------------------------------------------------------
/** A line revealed word by word: 6 f apart, each 26 f on E.out, rising 0.32 em, blur 8 → 0 clear by 60%. Slots are kept. */
export const Words = ({f, at, words, gap = '0.26em', stagger = 6}: {f: number; at: number; words: ReactNode[]; gap?: string; stagger?: number}) => (
  <>
    {words.map((w, i) => {
      const p = prog(f, at + i * stagger, 26, E.out);
      const blur = 8 * (1 - Math.min(1, p / 0.6));
      return (
        <span key={i} style={{display: 'inline-block', marginRight: i < words.length - 1 ? gap : 0, opacity: p, transform: `translateY(${(1 - p) * 0.32}em)`, filter: blur > 0.75 ? `blur(${blur.toFixed(1)}px)` : undefined}}>
          {w}
        </span>
      );
    })}
  </>
);
