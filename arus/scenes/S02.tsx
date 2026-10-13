// S2 · 3.22–9.27s — Hook B: the bank shows what's left, Arus shows where it went.
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {type CameraKey, type Cue, cue, prog, roundK, rupiah} from '../core';
import {FlowDots, Marker} from '../Fx';
import {C, body, display, panel} from '../palette';

const ARUS_AT = cue('S2', 1); // VO: "Arus kasih tahu ke mana perginya."
const LINES_AT = ARUS_AT + 30;

// Where the Rp 3.938.000 went (Rp 4.250.000 − Rp 312.000 from S1).
const ROWS = [
  {name: 'Makan', amount: 1_420_000},
  {name: 'Belanja', amount: 1_088_000},
  {name: 'Tagihan', amount: 750_000},
  {name: 'Transport', amount: 680_000},
];
const SRC = {x: 90, y: 340};
const rowY = (i: number) => 190 + i * 100;
const branch = (i: number) => `M${SRC.x} ${SRC.y} C${SRC.x + 150} ${SRC.y} ${SRC.x + 120} ${rowY(i)} ${SRC.x + 250} ${rowY(i)}`;

// Tight on the bank card, then pull back to reveal where the money went.
export const camera: CameraKey[] = [{at: 0, zoom: 1.2, x: 540, y: 560, dur: 1}, {at: ARUS_AT - 10, zoom: 1, dur: 36}];

export const sfx: Cue[] = [{at: ARUS_AT, sound: 'hit', volume: 0.8}];

const label = (text: React.ReactNode, color: string, top: number, p: number) => (
  <div
    style={{
      position: 'absolute',
      top,
      left: 80,
      fontFamily: display,
      fontWeight: 700,
      fontSize: 76,
      color,
      opacity: p,
      transform: `translateX(${(1 - p) * -40}px)`,
    }}
  >
    {text}
  </div>
);

export const Scene = () => {
  const f = useCurrentFrame();
  const topIn = prog(f, 0, 24);
  const arusIn = prog(f, ARUS_AT, 26);
  const dim = interpolate(arusIn, [0, 1], [1, 0.4]);

  return (
    <AbsoluteFill>
      {label('sisa', C.onBandSoft, 230, topIn * dim)}
      {/* Generic bank-style card: flat, grey, one number. */}
      <div
        style={{
          position: 'absolute',
          top: 350,
          left: 80,
          width: 920,
          height: 400,
          borderRadius: 20,
          background: 'oklch(0.27 0 0)',
          padding: '56px 60px',
          boxSizing: 'border-box',
          fontFamily: body,
          color: 'oklch(0.78 0 0)',
          opacity: topIn * dim,
          transform: `perspective(1400px) translateY(${(1 - topIn) * 30 - arusIn * 40}px) rotateX(${arusIn * 22}deg)`,
          transformOrigin: 'top center',
        }}
      >
        <div style={{fontWeight: 600, fontSize: 38}}>Rekening •••• 1234</div>
        <div style={{fontWeight: 600, fontSize: 34, marginTop: 70, color: 'oklch(0.62 0 0)'}}>Saldo</div>
        <div style={{fontWeight: 800, fontSize: 96}}>{rupiah(312_000)}</div>
      </div>

      {label(<Marker at={ARUS_AT + 14} f={f}>perginya</Marker>, C.highlight, 850, arusIn)}
      <div
        style={{
          ...panel,
          position: 'absolute',
          top: 980,
          left: 80,
          width: 920,
          height: 560,
          overflow: 'hidden',
          opacity: arusIn,
          transform: `translateY(${(1 - arusIn) * 40}px)`,
        }}
      >
        <svg width={920} height={560} style={{position: 'absolute', inset: 0}}>
          <circle cx={SRC.x} cy={SRC.y} r={14} fill={C.accent} />
          {ROWS.map((_, i) => (
            <FlowDots key={`d${i}`} d={branch(i)} f={f} from={LINES_AT + i * 16 + 12} color={C.accentStrong} count={3} speed={5} r={6} reveal={prog(f, LINES_AT + i * 16, 40)} />
          ))}
          {ROWS.map((_, i) => {
            const p = prog(f, LINES_AT + i * 16, 40);
            return (
              <path
                key={i}
                d={branch(i)}
                stroke={C.accent}
                strokeWidth={6}
                strokeLinecap="round"
                fill="none"
                pathLength={1}
                strokeDasharray="1 1"
                strokeDashoffset={1 - p}
                opacity={p > 0 ? 1 : 0}
              />
            );
          })}
        </svg>
        <div style={{position: 'absolute', left: 40, top: 400, fontFamily: body, fontWeight: 600, fontSize: 32, color: C.inkFaint}}>
          Oktober
        </div>
        {ROWS.map((r, i) => {
          const p = prog(f, LINES_AT + i * 16 + 28, 18);
          return (
            <div
              key={r.name}
              style={{
                position: 'absolute',
                left: 370,
                right: 50,
                top: rowY(i) - 28,
                display: 'flex',
                justifyContent: 'space-between',
                fontFamily: body,
                fontSize: 38,
                whiteSpace: 'nowrap',
                opacity: p,
                transform: `translateX(${(1 - p) * 20}px)`,
              }}
            >
              <span style={{fontWeight: 600, color: C.ink}}>{r.name}</span>
              <span style={{fontWeight: 800, color: C.expense, fontVariantNumeric: 'tabular-nums'}}>{rupiah(roundK(r.amount * prog(f, LINES_AT + i * 16 + 28, 24)))}</span>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
