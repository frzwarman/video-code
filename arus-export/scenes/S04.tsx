// S4 — The Excel file: each thing the export does is shown as the voice names it and ticked off below the
// sheet: the bold frozen header (it stays while the rows scroll), the filter buttons, real dates and numbers;
// then sort by Amount, filter Category to Makan, and SUBTOTAL the rest to 1,420,000.
import {Check} from 'lucide-react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {type CameraKey, type Cue, lerp, prog} from '../../lib/core';
import {E, accentInk, fresh, hitPulse, punch} from '../../lib/motion';
import {C, body} from '../../lib/palette';
import {MAKAN_TOTAL, ROWS, grouped} from '../data';
import {COLS, ROW_H, type BodyRow, SheetGrid, colX} from '../Sheet';
import {cue} from '../voice';

// VO: "File Excel-nya langsung RAPI:" | "judul kolom tebal dan terkunci," | "tombol filter sudah siap,"
//     | "tanggal dan nominal sudah berformat." | "Tinggal urutkan, saring, dan jumlahkan."
const c = (seg: number, frac = 0) => cue('S4', seg, frac);
const HEADER_AT = c(1, 0.05);
const SCROLL_AT = c(1, 0.5); // rows scroll under the header, which stays
const FILTERS_AT = c(2, 0.1);
const TINT_AT = c(3, 0.1);
const UNSCROLL_AT = c(3);
const SORT_AT = c(4, 0.04); // urutkan
const FILTER_AT = c(4, 0.38); // saring
const SUM_AT = c(4, 0.72); // jumlahkan
const SUM_DUR = 40;
const CHECKS = [
  {at: c(1, 0.92), label: 'Judul kolom terkunci'},
  {at: c(2, 0.9), label: 'Filter siap'},
  {at: c(3, 0.92), label: 'Tanggal & angka'},
];

const SHEET = {left: 40, top: 230, width: 1000};
const HEAD_Y = SHEET.top + 60 + 38 + 29;
const ORDER = ROWS.map((_, i) => i).sort((a, b) => ROWS[b].amount - ROWS[a].amount); // by Amount, largest first
const RANK = ORDER.reduce<number[]>((r, row, k) => ((r[row] = k), r), []);

export const camera: CameraKey[] = [
  {at: 0, zoom: 1, x: 540, y: 960, dur: 1},
  // "tebal dan terkunci": hard cut in on the bold header, back out as the rows scroll under it.
  ...punch(HEADER_AT, SHEET.left + 300, HEAD_Y, {zoom: 1.15, x: 540, y: 640}, 2.2, 40),
  // "tombol filter": run along the header's filter buttons.
  {at: c(2) - 8, zoom: 1.8, x: SHEET.left + 120, y: HEAD_Y},
  {at: c(2, 0.3), zoom: 1.8, x: SHEET.left + 960, y: HEAD_Y, dur: 72},
  {at: c(3) - 8, zoom: 1.25, x: SHEET.left + 300, y: 700},
  {at: c(4) - 8, zoom: 1.1, x: 540, y: 820},
];

export const sfx: Cue[] = [
  {at: HEADER_AT, sound: 'click', volume: 0.5},
  {at: SCROLL_AT, sound: 'whoosh', volume: 0.25},
  ...COLS.map((_, i) => ({at: FILTERS_AT + i * 6, sound: 'tick', volume: 0.25})),
  ...CHECKS.map(({at}) => ({at, sound: 'click', volume: 0.5})),
  ...[0, 1, 2, 3].map((i) => ({at: SORT_AT + i * 6, sound: 'tick', volume: 0.3})),
  {at: FILTER_AT, sound: 'whoosh', volume: 0.3},
  {at: SUM_AT + SUM_DUR, sound: 'snap', volume: 0.6},
];

export const Scene = () => {
  const f = useCurrentFrame();
  const sortP = prog(f, SORT_AT, 30, E.ui);
  const hideP = prog(f, FILTER_AT, 18, E.ui);
  // Positions come from the data: sorted slots, then the filtered rows closing up.
  const filteredY: number[] = [];
  let acc = 0;
  for (const i of ORDER) {
    filteredY[i] = acc;
    acc += ROWS[i].category === 'Makan' ? ROW_H : ROW_H * (1 - hideP);
  }
  const rows: BodyRow[] = ROWS.map((tx, i) => ({
    key: String(i),
    num: (sortP < 0.5 ? i : RANK[i]) + 2,
    tx,
    y: hideP > 0 ? filteredY[i] : lerp(i * ROW_H, RANK[i] * ROW_H, sortP),
    alpha: tx.category === 'Makan' ? 1 : 1 - hideP,
  }));
  const summing = f >= SUM_AT - 10;
  if (summing) rows.push({key: 'sum', num: 22, y: acc, alpha: prog(f, SUM_AT - 10, 10, E.smooth), sum: {label: 'Total', value: <span style={{color: accentInk(fresh(f, SUM_AT + SUM_DUR, 24))}}>{grouped(MAKAN_TOTAL * prog(f, SUM_AT, SUM_DUR, E.type))}</span>}});
  const scrollY = 300 * prog(f, SCROLL_AT, 40, E.glide) * (1 - prog(f, UNSCROLL_AT, 30, E.glide));
  const tint = prog(f, TINT_AT, 12, E.smooth) * (1 - prog(f, c(4) - 6, 16, E.smooth));
  return (
    <AbsoluteFill>
      <SheetGrid
        {...SHEET}
        bodyH={13 * ROW_H}
        rows={rows}
        scrollY={scrollY}
        formula={summing ? '=SUBTOTAL(9,C2:C21)' : f >= TINT_AT && f < c(4) ? '2026-10-14' : ''}
        filterIn={(i) => 1 + 0.35 * hitPulse(f, FILTERS_AT + i * 6, 3, 8)}
        filterOn={f >= FILTER_AT ? 'category' : undefined}
        tint={{date: tint, amount: tint}}
        selected={summing ? {x: colX(2), y: acc, w: COLS[2].w, h: ROW_H} : f >= TINT_AT && f < c(4) ? {x: colX(0), y: 0, w: COLS[0].w, h: ROW_H} : undefined}
      />
      {CHECKS.map(({at, label}, i) => {
        if (f < at) return null;
        const p = prog(f, at, 24, E.out);
        return (
          <div key={label} style={{position: 'absolute', left: 0, right: 0, top: 1130 + i * 96, display: 'flex', justifyContent: 'center', opacity: prog(f, at, 10, E.smooth), transform: `translateY(${(1 - p) * 30}px)`}}>
            <div style={{display: 'flex', alignItems: 'center', gap: 16, padding: '14px 30px 14px 16px', borderRadius: 999, background: C.raised, fontFamily: body, fontWeight: 800, fontSize: 38, color: C.ink, boxShadow: '0 16px 36px -20px oklch(0.2 0.06 168 / 0.6)'}}>
              <span style={{display: 'grid', placeItems: 'center', width: 48, height: 48, borderRadius: '50%', background: C.accentStrong, transform: `scale(${1 + 0.15 * hitPulse(f, at + 4)})`}}>
                <Check size={28} color="#fff" strokeWidth={3} />
              </span>
              {label}
            </div>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};
