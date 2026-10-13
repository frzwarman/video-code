// S6 · 27.78–32.08s — Budgets fill as October runs from day 1 to 31.
import {AbsoluteFill, interpolate, interpolateColors, random, useCurrentFrame} from 'remotion';
import {type CameraKey, type Cue, cue, fadeUp, kick, prog, rupiah} from '../core';
import {Calendar} from '../icons';
import {CATEGORY, Tile} from '../lucide';
import {C, body, display, panel} from '../palette';
import {Sticker} from '../Sticker';

const RUN = {from: cue('S6', 0, 0.1), to: cue('S6', 0, 1)}; // frames over which day 1 → 31 plays
const DAYS = 31;
// Makan matches S2's Rp 1.420.000. Bars turn yellow halfway and red near the end; Hiburan gets there.
const MID = 0.5;
const END = 0.9;
const BUDGETS = [
  {name: 'Makan', limit: 2_000_000, spent: 1_420_000},
  {name: 'Transport', limit: 800_000, spent: 680_000},
  {name: 'Hiburan', limit: 400_000, spent: 392_000},
];

// Seeded daily spending, as a cumulative 0 → 1 share per day.
const share = BUDGETS.map((b) => {
  const daily = Array.from({length: DAYS}, (_, d) => 0.2 + random(`s6-${b.name}-${d}`));
  const total = daily.reduce((a, x) => a + x, 0);
  let run = 0;
  return daily.map((x) => (run += x) / total);
});

const dayAt = (f: number) => interpolate(f, [RUN.from, RUN.to], [0, DAYS], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

// A tick every 5 days, getting louder toward month end.

export const sfx: Cue[] = [5, 10, 15, 20, 25, 30].map((d, i) => ({
  at: Math.round(RUN.from + ((RUN.to - RUN.from) * d) / DAYS),
  sound: 'tick',
  volume: 0.25 + i * 0.08,
}));

// Interpolate between whole days so the bars move smoothly.
const used = (i: number, day: number) => {
  const d = Math.floor(day);
  const a = d === 0 ? 0 : share[i][d - 1];
  const b = share[i][Math.min(d, DAYS - 1)];
  return day >= DAYS ? 1 : a + (b - a) * (day - d);
};
// The frame Hiburan crosses the warning line: its card flinches and the warning pops.
const WARN_AT = Array.from({length: RUN.to - RUN.from + 1}, (_, i) => RUN.from + i).find((fr) => (BUDGETS[2].spent * used(2, dayAt(fr))) / BUDGETS[2].limit >= END) ?? RUN.to;

// Push onto the bar that crosses the line.
export const camera: CameraKey[] = [{at: 0, zoom: 1.2, x: 500, y: 340, dur: 1}, {at: 14, zoom: 1, dur: 36}, {at: WARN_AT - 6, zoom: 1.2, x: 540, y: 1020, dur: 30}];

export const Scene = () => {
  const f = useCurrentFrame();
  const day = dayAt(f);
  const whole = Math.max(1, Math.ceil(day));

  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', top: 300, left: 100, fontFamily: display, fontSize: 72, fontWeight: 800, color: C.onBand, ...fadeUp(prog(f, 0, 22))}}>
        Anggaran Oktober
      </div>
      {BUDGETS.map((b, i) => {
        const spent = b.spent * used(i, day);
        const pct = spent / b.limit;
        const mid = prog(pct, MID, 0.04);
        const end = prog(pct, END, 0.04);
        const bar = interpolateColors(end, [0, 1], [interpolateColors(mid, [0, 1], [C.accent, C.warnBar]), C.expense]);
        const amountColor = interpolateColors(end, [0, 1], [interpolateColors(mid, [0, 1], [C.ink, C.warn]), C.expense]);
        return (
          <div
            key={b.name}
            style={{
              ...panel,
              ...fadeUp(prog(f, 8 + i * 8, 22), 40),
              position: 'absolute',
              top: 480 + i * 250,
              left: 100 + (i === 2 ? kick(f, WARN_AT, 10, 6) : 0),
              width: 880,
              height: 210,
              padding: '40px 52px',
              boxSizing: 'border-box',
              fontFamily: body,
            }}
          >
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'baseline'}}>
              <span style={{fontWeight: 800, fontSize: 46, color: C.ink, display: 'flex', alignItems: 'center', gap: 16, whiteSpace: 'nowrap'}}>
                <Tile icon={CATEGORY[b.name].icon} tone={CATEGORY[b.name].tone} size="sm" scale={1.6} />
                {b.name}
                {i === 2 && f >= WARN_AT && (
                  <span style={{padding: '2px 14px', borderRadius: 999, background: C.expense, color: C.onAccent, fontSize: 28, fontWeight: 800, transform: `scale(${0.7 + 0.3 * prog(f, WARN_AT, 12)})`}}>
                    {Math.round(pct * 100)}%
                  </span>
                )}
              </span>
              <span style={{fontWeight: 600, fontSize: 32, color: C.inkSoft, fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap'}}>
                <span style={{color: amountColor, fontWeight: 800}}>{rupiah(spent)}</span> / {rupiah(b.limit)}
              </span>
            </div>
            <div style={{position: 'relative', height: 30, borderRadius: 15, background: C.sunken, marginTop: 34, overflow: 'hidden'}}>
              <div style={{width: `${pct * 100}%`, height: '100%', borderRadius: 15, background: bar}} />
              {/* A bright head on the leading edge while the month runs. */}
              <div style={{position: 'absolute', top: 0, left: `calc(${pct * 100}% - 18px)`, width: 18, height: '100%', borderRadius: 9, background: '#fff', opacity: day < DAYS ? 0.5 : 0}} />
            </div>
          </div>
        );
      })}
      <Sticker Icon={Calendar} x={180} y={1262} at={24} f={f} tilt={-6} size={130} />
      <div style={{position: 'absolute', top: 1260, width: '100%', textAlign: 'center', fontFamily: body, ...fadeUp(prog(f, 20, 20))}}>
        <div style={{fontWeight: 600, fontSize: 34, letterSpacing: 4, color: C.onBandSoft}}>HARI</div>
        <div style={{fontWeight: 800, fontSize: 84, color: C.onBand, fontVariantNumeric: 'tabular-nums', transform: `scale(${1 + (day > 0 && day < DAYS ? 0.06 * Math.exp(-(day - Math.floor(day)) * 5) : 0)})`}}>{whole} Okt</div>
      </div>
    </AbsoluteFill>
  );
};
