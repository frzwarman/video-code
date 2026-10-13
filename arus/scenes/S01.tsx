// S1 · 0.0–3.22s — Hook A: the question, and a balance that drains.
import {AbsoluteFill, interpolateColors, random, useCurrentFrame} from 'remotion';
import {type CameraKey, type Cue, cue, prog, rupiah} from '../core';
import {Bag, Bus, Coffee, Receipt, Ticket} from '../icons';
import {C, body, display} from '../palette';
import {FlyChip} from '../Fx';
import {Sticker} from '../Sticker';

const WORDS = 'Bulan lalu, uangmu habis ke mana?'.split(' ');
const FROM = 4_250_000;
const TO = 312_000;
const STEPS = 14;
const START = cue('S1', 0, 0.15);
const END = cue('S1', 0, 1);

// Ticks get closer together (spending speeds up), then stop dead on the last one.
const stepFrame = (i: number) => START + Math.round((END - START) * Math.pow(i / STEPS, 0.6));
const stepValue = (i: number) =>
  i === STEPS ? TO : Math.round((FROM - (FROM - TO) * (i / STEPS + (random(`s1-${i}`) - 0.5) * 0.04)) / 500) * 500;

// Where the money went: one sticker pops in every few ticks.
const STICKERS = [
  {Icon: Coffee, x: 110, y: 290, step: 2, tilt: -8},
  {Icon: Bag, x: 820, y: 260, step: 5, tilt: 6},
  {Icon: Bus, x: 90, y: 1300, step: 8, tilt: 5},
  {Icon: Receipt, x: 840, y: 1330, step: 11, tilt: -6},
  {Icon: Ticket, x: 465, y: 1390, step: 14, tilt: 3},
];

// Push into the balance as it drains.
export const camera: CameraKey[] = [{at: END - 40, zoom: 1.25, x: 540, y: 1120, dur: 50}];

export const sfx: Cue[] = Array.from({length: STEPS}, (_, i) => ({at: stepFrame(i + 1), sound: 'tick', volume: 0.45}));

export const Scene = () => {
  const f = useCurrentFrame();
  let step = 0;
  while (step < STEPS && stepFrame(step + 1) <= f) step++;
  const done = prog(f, END, 12);
  const punch = 1 + 0.06 * (1 - prog(f, END, 14));
  const counterIn = prog(f, 18, 20);

  return (
    <AbsoluteFill>
      {STICKERS.map(({step: s, ...st}) => (
        <Sticker key={s} {...st} at={stepFrame(s) + 16} f={f} />
      ))}
      {/* Each sticker is paid for: a chip leaves the balance and lands on it. */}
      {STICKERS.map(({step: s, x, y}) => (
        <FlyChip key={`c${s}`} f={f} at={stepFrame(s)} dur={18} from={{x: 540, y: 1160}} to={{x: x + 75, y: y + 75}} text={'−' + rupiah((s === 1 ? FROM : stepValue(s - 1)) - stepValue(s))} />
      ))}
      <div style={{position: 'absolute', top: 560, left: 90, right: 90, textAlign: 'center'}}>
        {WORDS.map((w, i) => {
          const p = prog(f, i * 4, 22);
          return (
            <span
              key={i}
              style={{
                display: 'inline-block',
                marginRight: '0.28em',
                fontFamily: display,
                fontWeight: 700,
                fontSize: 92,
                lineHeight: 1.15,
                color: C.ink,
                opacity: p,
                transform: `translateY(${(1 - p) * 40}px)`,
                filter: p < 1 ? `blur(${(1 - p) * 10}px)` : undefined,
              }}
            >
              {w}
            </span>
          );
        })}
      </div>
      <div style={{position: 'absolute', top: 1010, width: '100%', textAlign: 'center', opacity: counterIn}}>
        <div style={{fontFamily: body, fontWeight: 600, fontSize: 40, letterSpacing: 6, color: C.onBgSoft}}>SALDO</div>
        <div
          style={{
            fontFamily: body,
            fontWeight: 800,
            fontSize: 124,
            fontVariantNumeric: 'tabular-nums',
            color: interpolateColors(done, [0, 1], [C.ink, C.expense]),
            transform: `scale(${f >= END ? punch : 1})`,
          }}
        >
          {rupiah(step === 0 ? FROM : stepValue(step))}
        </div>
      </div>
    </AbsoluteFill>
  );
};
