// Shared motion assets. Everything here is a pure function of the frame passed in.
import {getLength, getPointAtLength} from '@remotion/paths';
import {useMemo, type ReactNode} from 'react';
import {Easing, random} from 'remotion';
import {lerp, prog, swift} from './core';
import {C, body} from './palette';

const scan = Easing.inOut(Easing.cubic);

/** A light bar sweeping down over an area: "the text is being read". Place inside a positioned parent. */
export const ScanBeam = ({f, at, dur, top, height, left = 0, right = 0}: {f: number; at: number; dur: number; top: number; height: number; left?: number; right?: number}) => {
  const p = prog(f, at, dur, scan);
  if (f < at || p >= 1) return null;
  const y = top + p * height;
  return (
    <>
      <div style={{position: 'absolute', left, right, top: y - 140, height: 140, background: `linear-gradient(to bottom, transparent, ${C.highlightSoft})`}} />
      <div style={{position: 'absolute', left, right, top: y - 3, height: 6, background: C.highlight, boxShadow: `0 0 28px ${C.highlight}`}} />
    </>
  );
};

/** Dots streaming along an SVG path: money in motion. Render inside the path's <svg>. */
export const FlowDots = ({d, f, from, color, count = 4, speed = 7, r = 7, reveal = 1}: {d: string; f: number; from: number; color: string; count?: number; speed?: number; r?: number; reveal?: number}) => {
  const L = useMemo(() => getLength(d), [d]);
  if (f < from) return null;
  const spacing = L / count;
  return (
    <g fill={color}>
      {Array.from({length: count}, (_, k) => {
        const s = ((f - from) * speed + k * spacing) % L;
        if (s > reveal * L) return null;
        const pt = getPointAtLength(d, s);
        if (!pt) return null;
        // Fade at both ends of the path so dots never pop in or out.
        const edge = Math.min(1, s / 50, (L - s) / 50);
        return <circle key={k} cx={pt.x} cy={pt.y} r={r} opacity={0.95 * edge} />;
      })}
    </g>
  );
};

/** A small pill that flies from one point to another on an arc, then fades. */
export const FlyChip = ({f, at, dur = 22, from, to, text, color = C.expense, ink = C.onAccent}: {f: number; at: number; dur?: number; from: {x: number; y: number}; to: {x: number; y: number}; text: string; color?: string; ink?: string}) => {
  const p = prog(f, at, dur, swift);
  if (f < at || p >= 1) return null;
  const x = lerp(from.x, to.x, p);
  const y = lerp(from.y, to.y, p) - Math.sin(p * Math.PI) * 70;
  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        transform: `translate(-50%, -50%) scale(${0.9 + 0.1 * prog(f, at, 6)})`,
        opacity: Math.min(prog(f, at, 5), 1 - prog(f, at + dur - 8, 8)),
        padding: '8px 22px',
        borderRadius: 999,
        background: color,
        color: ink,
        fontFamily: body,
        fontWeight: 800,
        fontSize: 34,
        whiteSpace: 'nowrap',
      }}
    >
      {text}
    </div>
  );
};

/** One expanding ring from a point. */
export const Ring = ({f, at, x, y, r0 = 20, r1 = 160, dur = 30, color = C.highlight, width = 5}: {f: number; at: number; x: number; y: number; r0?: number; r1?: number; dur?: number; color?: string; width?: number}) => {
  const p = prog(f, at, dur);
  if (f < at || p >= 1) return null;
  const r = lerp(r0, r1, p);
  return <div style={{position: 'absolute', left: x - r, top: y - r, width: 2 * r, height: 2 * r, borderRadius: '50%', border: `${width}px solid ${color}`, opacity: 0.9 * (1 - p)}} />;
};

/** `text` with its characters replaced by seeded cipher glyphs; `p` = how much of it is scrambled (0–1). */
export const scramble = (text: string, p: number, f: number, seed: string) => {
  const glyphs = '#%&@xk9q2z7m4';
  const bucket = Math.floor(f / 3); // flicker every 3 frames, deterministic
  return text
    .split('')
    .map((ch, i) => (ch === ' ' || i / text.length >= p ? ch : glyphs[Math.floor(random(`${seed}-${bucket}-${i}`) * glyphs.length)]))
    .join('');
};

/** A highlighter stroke drawn under a word, left to right, at frame `at`. Wrap the word. */
export const Marker = ({children, at, f, color = 'oklch(0.93 0.11 165 / 0.42)', dur = 14}: {children: ReactNode; at: number; f: number; color?: string; dur?: number}) => (
  <span style={{position: 'relative', display: 'inline-block', whiteSpace: 'nowrap'}}>
    <span style={{position: 'absolute', left: '-0.08em', right: '-0.08em', bottom: '0.04em', height: '0.46em', borderRadius: '0.1em', background: color, transform: `scaleX(${prog(f, at, dur)}) skewX(-10deg)`, transformOrigin: 'left center'}} />
    <span style={{position: 'relative'}}>{children}</span>
  </span>
);
/** The highlighter on a white panel: classic yellow. */
export const YELLOW_MARK = 'oklch(0.9 0.17 95 / 0.55)';
