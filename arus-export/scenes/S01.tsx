// S1 — Hook C: an empty sheet fills itself (bold header, frozen line, filter buttons, October's rows) and the
// month's spending is summed; then a scale-through cut to the one tap that made it: Reports → Export.
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {type CameraKey, type Cue, lerp, prog} from '../../lib/core';
import {E, Tap, Words, accentInk, fresh, pressScale} from '../../lib/motion';
import {C, display} from '../../lib/palette';
import {Phone} from '../../lib/Phone';
import {OUT_TOTAL, ROWS, grouped} from '../data';
import {EXPORT_BTN, PHONE, RANGES, Reports, ZOOM, toScene} from '../Reports';
import {COLS, ROW_H, type BodyRow, SheetGrid, colX} from '../Sheet';
import {cue} from '../voice';

// VO (after 2.6 s of picture): "Satu bulan pengeluaran." | "Satu KETUKAN." | "Begini caranya."
const HEAD_AT = 8; // header cells land, 3 f apart
const FROZEN_AT = 40;
const FILTERS_AT = 48;
const ROWS_AT = 66; // rows pour in, 3 f apart
const SUM_AT = cue('S1', 0, 0.1); // "Satu bulan pengeluaran": the total counts up
const SUM_DUR = 50;
const CUT_AT = cue('S1', 1) - 2; // "Satu KETUKAN.": cut to the phone…
const PRESS_AT = cue('S1', 1, 0.45); // …and Export is pressed
const LINE_AT = cue('S1', 2); // "Begini caranya."

const SHEET = {left: 40, top: 250, width: 1000};
const AMOUNT_X = SHEET.left + colX(2) + COLS[2].w / 2;
const SUM_Y = SHEET.top + 156 + 20 * ROW_H + ROW_H / 2;
const BTN = toScene(EXPORT_BTN.x, EXPORT_BTN.y);

export const camera: CameraKey[] = [
  {at: 0, zoom: 1.5, x: AMOUNT_X, y: SHEET.top + 120, dur: 1},
  // Glide down the Amount column as the rows pour in, landing on the total.
  {at: ROWS_AT, zoom: 1.5, x: AMOUNT_X, y: SUM_Y, dur: 96},
  {at: CUT_AT, zoom: 1.6, x: BTN.x, y: BTN.y, cut: true},
  {at: LINE_AT - 8, zoom: 1, x: 540, y: 960},
];

export const sfx: Cue[] = [
  ...[0, 2, 4, 6, 8].map((i) => ({at: HEAD_AT + i * 3, sound: 'click', volume: 0.3})),
  ...Array.from({length: 10}, (_, i) => ({at: ROWS_AT + i * 6, sound: 'tick', volume: 0.25})),
  {at: SUM_AT + SUM_DUR, sound: 'snap', volume: 0.6},
  {at: CUT_AT - 10, sound: 'whoosh', volume: 0.35},
  {at: PRESS_AT, sound: 'tap', volume: 0.8},
];

export const Scene = () => {
  const f = useCurrentFrame();
  const sheet = f < CUT_AT;
  const total = OUT_TOTAL * prog(f, SUM_AT, SUM_DUR, E.type);
  const rows: BodyRow[] = ROWS.map((tx, i) => {
    const at = ROWS_AT + i * 3;
    return {key: String(i), num: i + 2, tx, y: i * ROW_H + (1 - prog(f, at, 18, E.out)) * 24, alpha: prog(f, at, 10, E.smooth)};
  });
  if (f >= SUM_AT - 12) rows.push({key: 'sum', num: 22, y: 20 * ROW_H, alpha: prog(f, SUM_AT - 12, 10, E.smooth), sum: {label: 'Total out', value: <span style={{color: accentInk(fresh(f, SUM_AT + SUM_DUR, 24))}}>{grouped(total)}</span>}});
  // The scale-through inside the scene: the sheet rushes in (fastest on the cut), the phone lands from 1.7×.
  const rush = lerp(1, 1.3, prog(f, CUT_AT - 18, 18, E.exit));
  const land = lerp(1.7, 1, prog(f, CUT_AT, 36, E.out));
  return (
    <AbsoluteFill>
      {sheet ? (
        <AbsoluteFill style={{transformOrigin: `${AMOUNT_X}px ${SUM_Y}px`, transform: `scale(${rush})`}}>
          <SheetGrid
            {...SHEET}
            bodyH={21 * ROW_H}
            rows={rows}
            formula={f >= SUM_AT - 12 ? '=SUMIF(D2:D21,"out",C2:C21)' : ''}
            headerIn={(i) => prog(f, HEAD_AT + i * 3, 16, E.out)}
            filterIn={(i) => prog(f, FILTERS_AT + i * 3, 12, E.out)}
            frozen={prog(f, FROZEN_AT, 20, E.out)}
            selected={f >= SUM_AT - 12 ? {x: colX(2), y: 20 * ROW_H, w: COLS[2].w, h: ROW_H} : undefined}
          />
        </AbsoluteFill>
      ) : (
        <AbsoluteFill style={{transformOrigin: `${BTN.x}px ${BTN.y}px`, transform: `scale(${land})`}}>
          <div style={{position: 'absolute', top: 196, width: '100%', textAlign: 'center', fontFamily: display, fontWeight: 800, fontSize: 60, letterSpacing: -1, color: C.onBand}}>
            <Words f={f} at={LINE_AT} words={['Laporan', '→', 'Export']} />
          </div>
          <Phone w={PHONE.w} h={PHONE.h} screen={C.surface} style={{left: PHONE.left, top: PHONE.top, borderRadius: 96}}>
            <div style={{position: 'absolute', left: 0, top: 0, transformOrigin: 'top left', transform: `scale(${ZOOM})`}}>
              <Reports range="Month" shown={RANGES.Month} press={pressScale(f, PRESS_AT)} />
            </div>
          </Phone>
          <Tap f={f} at={PRESS_AT} x={BTN.x} y={BTN.y} w={EXPORT_BTN.w * ZOOM} h={EXPORT_BTN.h * ZOOM} />
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};
