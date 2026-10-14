// S5 — The CSV: Export → CSV; the download banner grows into the file itself (plain text, amounts with no
// separators); then the text splits into columns under an Excel header, column for column, and they match.
import {Check, FileText} from 'lucide-react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {type CameraKey, type Cue, lerp, prog} from '../../lib/core';
import {E, Tap, hitPulse, pressScale, usePhoneIn} from '../../lib/motion';
import {C, body} from '../../lib/palette';
import {Phone} from '../../lib/Phone';
import {PANEL} from '../../lib/ui';
import {CSV_HEADER, FILE, ROWS, csvCells} from '../data';
import {EXPORT_BTN, MENU, PHONE, RANGES, Reports, ZOOM, menuItem, toScene} from '../Reports';
import {COLS, colX} from '../Sheet';
import {cue} from '../voice';

// VO: "Butuh yang lebih universal?" | "CSV bisa dibuka di aplikasi spreadsheet APA PUN," | "dengan kolom yang sama."
const EXPORT_AT = cue('S5', 0, 0.2);
const MENU_AT = EXPORT_AT + 6;
const PICK_CSV = cue('S5', 0, 0.85);
const CLOSE_AT = PICK_CSV + 8;
const BANNER_AT = PICK_CSV + 12;
const OPEN_AT = cue('S5', 1, 0.05); // the banner grows into the file
const SPLIT_AT = cue('S5', 2); // "dengan kolom yang sama": the text splits into columns
const MATCH_AT = SPLIT_AT + 34;

const BTN = toScene(EXPORT_BTN.x, EXPORT_BTN.y);
const CSV_ITEM = toScene(menuItem(0).x, menuItem(0).y);
const BANNER = {x: PHONE.left + 19 + 12 * ZOOM, y: PHONE.top + 19 + 44 * ZOOM, w: 370 * ZOOM, h: 56 * ZOOM};
const FILEP = {x: 40, y: 600, w: 1000, h: 420};
const CW = 12.04; // ui-monospace at 20 px
const LINE_Y = (k: number) => 74 + k * 44; // text line k, from the panel top
const GRID_Y = (k: number) => 22 + k * 56; // the same line once split into rows
const HEADER_Y = FILEP.y - 70; // the Excel header the columns line up under

const LINES = [CSV_HEADER, ...ROWS.slice(0, 4).map(csvCells)];

export const camera: CameraKey[] = [
  {at: 0, zoom: 1.3, x: 540, y: 560, dur: 1},
  {at: OPEN_AT - 4, zoom: 1, x: 540, y: 820},
];

export const sfx: Cue[] = [
  {at: EXPORT_AT, sound: 'tap', volume: 0.8},
  {at: MENU_AT, sound: 'whoosh', volume: 0.25},
  {at: PICK_CSV, sound: 'tap', volume: 0.8},
  {at: BANNER_AT, sound: 'ding', volume: 0.4},
  {at: OPEN_AT, sound: 'whoosh', volume: 0.35},
  {at: SPLIT_AT, sound: 'whoosh', volume: 0.3},
  {at: MATCH_AT, sound: 'snap', volume: 0.6},
];

export const Scene = () => {
  const f = useCurrentFrame();
  const phoneIn = usePhoneIn();
  const menu = prog(f, MENU_AT, 14, E.out) * (1 - prog(f, CLOSE_AT, 10, E.smooth));
  const banner = prog(f, BANNER_AT, 22, E.out);
  const open = prog(f, OPEN_AT, 34, E.glide);
  const split = prog(f, SPLIT_AT, 36, E.glide);
  const rect = {x: lerp(BANNER.x, FILEP.x, open), y: lerp(BANNER.y + (1 - banner) * -90, FILEP.y, open), w: lerp(BANNER.w, FILEP.w, open), h: lerp(BANNER.h, FILEP.h, open)};
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', inset: 0, opacity: 1 - 0.65 * open, transformOrigin: '540px 960px', transform: `scale(${1 - 0.06 * open})`}}>
        <Phone w={PHONE.w} h={PHONE.h} screen={C.surface} style={{left: PHONE.left, top: PHONE.top, borderRadius: 96, ...phoneIn}}>
          <div style={{position: 'absolute', left: 0, top: 0, transformOrigin: 'top left', transform: `scale(${ZOOM})`}}>
            <Reports range="Month" shown={RANGES.Month} menu={menu} menuLit={{csv: f >= PICK_CSV ? 1 - prog(f, CLOSE_AT, 10) : 0}} press={pressScale(f, EXPORT_AT)} />
          </div>
        </Phone>
        <Tap f={f} at={EXPORT_AT} x={BTN.x} y={BTN.y} w={EXPORT_BTN.w * ZOOM} h={EXPORT_BTN.h * ZOOM} />
        <Tap f={f} at={PICK_CSV} x={CSV_ITEM.x} y={CSV_ITEM.y} w={(MENU.w - 8) * ZOOM} h={MENU.item * ZOOM} r={12 * ZOOM} />
      </div>
      {/* The Excel header the CSV's columns line up under. */}
      {f >= SPLIT_AT && (
        <div style={{position: 'absolute', left: FILEP.x, top: HEADER_Y, width: FILEP.w, height: 58, overflow: 'hidden', borderRadius: 14, fontFamily: body, opacity: prog(f, SPLIT_AT, 12, E.smooth), transform: `translateY(${(1 - prog(f, SPLIT_AT, 26, E.out)) * -30}px)`}}>
          {COLS.map((col, i) => (
            <span key={col.key} style={{position: 'absolute', left: colX(i), width: col.w, top: 0, bottom: 0, display: 'flex', alignItems: 'center', gap: 6, padding: '0 10px', boxSizing: 'border-box', background: 'oklch(0.9 0.035 165)', borderLeft: '1px solid oklch(0.86 0.015 165)', fontSize: 22, fontWeight: 800, color: C.ink, whiteSpace: 'nowrap'}}>
              <span style={{flex: 1, overflow: 'hidden'}}>{col.label}</span>
              {f >= MATCH_AT + i * 4 && (
                <span style={{display: 'grid', placeItems: 'center', width: 26, height: 26, borderRadius: '50%', background: C.accentStrong, flex: 'none', transform: `scale(${prog(f, MATCH_AT + i * 4, 14, E.out) * (1 + 0.2 * hitPulse(f, MATCH_AT + i * 4 + 6))})`}}>
                  <Check size={16} color="#fff" strokeWidth={3} />
                </span>
              )}
            </span>
          ))}
          <span style={{position: 'absolute', left: 0, width: 52, top: 0, bottom: 0, background: C.sunken}} />
        </div>
      )}
      {/* The download banner, which grows into the file. */}
      {f >= BANNER_AT && (
        <div style={{position: 'absolute', left: rect.x, top: rect.y, width: rect.w, height: rect.h, ...PANEL, borderRadius: lerp(18 * ZOOM, 22, open), overflow: 'hidden', opacity: prog(f, BANNER_AT, 10, E.smooth), fontFamily: body}}>
          <div style={{position: 'absolute', left: 16, top: 0, height: lerp(BANNER.h, 56, open), display: 'flex', alignItems: 'center', gap: 12, fontSize: lerp(18, 24, open), fontWeight: 800, color: C.ink, whiteSpace: 'nowrap', opacity: 1 - split}}>
            <FileText size={lerp(24, 28, open)} color={C.accentStrong} />
            {FILE}.csv
          </div>
          {open > 0.5 &&
            LINES.map((cells, k) => {
              let at = 0;
              return cells.map((v, j) => {
                const textX = 20 + at * CW;
                at += v.length + 1;
                const x = lerp(textX, colX(j) + 10, split);
                const y = lerp(LINE_Y(k), GRID_Y(k), split);
                return (
                  <span key={`${k}-${j}`} style={{position: 'absolute', left: x, top: y, fontFamily: 'ui-monospace, Menlo, monospace', fontSize: 20, lineHeight: '28px', whiteSpace: 'pre', color: k === 0 ? C.ink : C.inkSoft, fontWeight: k === 0 ? 700 : 400, opacity: prog(f, OPEN_AT + 18 + k * 3, 10, E.smooth)}}>
                    {v}
                    {j < cells.length - 1 && <span style={{opacity: 1 - split}}>,</span>}
                  </span>
                );
              });
            })}
          {/* Column lines appear as the text settles into them. */}
          {COLS.map((col, i) => (
            <span key={col.key} style={{position: 'absolute', left: colX(i), top: 0, bottom: 0, width: 1, background: 'oklch(0.86 0.015 165)', opacity: prog(f, SPLIT_AT + 18, 16, E.smooth)}} />
          ))}
        </div>
      )}
    </AbsoluteFill>
  );
};
