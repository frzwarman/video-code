// Teal background for the whole film, with faint rising wave lines built from the logo's wave.
// The waves hold still inside a scene and glide one half-step at each scene cut (with the sweep).
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {prog} from './core';
import {C} from './palette';

const K = 46; // logo units → px
// One logo hump is (10, −4) units; repeating it makes a line rising left to right.
const wave = (x: number, y: number, humps: number) =>
  `M${x} ${y} c${4 * K} ${-6 * K} ${6 * K} ${2 * K} ${10 * K} ${-4 * K}` + ` s${6 * K} ${2 * K} ${10 * K} ${-4 * K}`.repeat(humps - 1);
const LINES = Array.from({length: 14}, (_, i) => wave(-20 * K, 300 + i * 230, 7));

export const Backdrop = ({cuts, sweep}: {cuts: number[]; sweep: number}) => {
  const f = useCurrentFrame();
  const steps = cuts.reduce((n, at) => n + prog(f, at - sweep / 2, sweep), 0);
  const dx = 5 * K * steps;
  const dy = -2 * K * steps;
  // Wrap after a full period (two half-steps) so the pattern never drifts off the frame.
  const period = steps % 2;
  return (
    <AbsoluteFill style={{background: `linear-gradient(170deg, ${C.bgTop} 0%, ${C.bg} 45%, ${C.bgBottom} 100%)`}}>
      <AbsoluteFill style={{background: 'radial-gradient(900px 700px at 90% 8%, rgb(63 214 173 / 0.28), transparent 70%), radial-gradient(800px 800px at 0% 100%, rgb(5 40 34 / 0.45), transparent 70%)'}} />
      <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
        <g transform={`translate(${5 * K * period} ${-2 * K * period})`} fill="none" stroke="#fff" strokeLinecap="round">
          {LINES.map((d, i) => (
            <path key={i} d={d} strokeWidth={i % 4 === 1 ? 5 : 2.5} strokeOpacity={i % 4 === 1 ? 0.1 : 0.06} />
          ))}
        </g>
      </svg>
    </AbsoluteFill>
  );
};
