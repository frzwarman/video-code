// The exported .xlsx as a spreadsheet shows it, drawn in scene px with no app branding: a formula bar, column
// letters, row numbers, the bold shaded frozen header with filter buttons, columns sized to their content
// (src/lib/xlsx.ts). Rows are placed by the caller (y in px from the top of the body), so a sort or a filter is
// computed positions, never a crossfade.
import {ChevronDown, Filter} from 'lucide-react';
import type {ReactNode} from 'react';
import {C, body} from '../lib/palette';
import {type Tx, direction, grouped} from './data';

export const COLS = [
  {key: 'date', label: 'Date', w: 150, right: true},
  {key: 'type', label: 'Type', w: 112},
  {key: 'amount', label: 'Amount', w: 140, right: true},
  {key: 'dir', label: 'Direction', w: 126},
  {key: 'account', label: 'Account', w: 120},
  {key: 'to', label: 'To account', w: 148},
  {key: 'category', label: 'Category', w: 138},
  {key: 'payee', label: 'Payee', w: 220},
  {key: 'note', label: 'Note', w: 340},
  {key: 'created', label: 'Created at (UTC)', w: 230, right: true},
] as const;
export type ColKey = (typeof COLS)[number]['key'];
export const RN = 52; // row-number column
export const FORMULA_H = 60;
export const LETTER_H = 38;
export const HEAD_H = 58;
export const ROW_H = 52;
export const BODY_TOP = FORMULA_H + LETTER_H + HEAD_H; // body starts this far below the sheet's top
/** Left edge of column i, from the sheet's left edge. */
export const colX = (i: number) => RN + COLS.slice(0, i).reduce((s, c) => s + c.w, 0);
export const colIndex = (key: ColKey) => COLS.findIndex((c) => c.key === key);

export const cell = (t: Tx, key: ColKey): string =>
  ({date: t.date, type: t.type, amount: grouped(t.amount), dir: direction(t), account: t.account, to: t.to ?? '', category: t.category ?? '', payee: t.payee ?? '', note: t.note ?? '', created: t.created})[key];

const FS = 23; // cell text, scene px
const HEAD_FILL = 'oklch(0.9 0.035 165)';
const LINE = 'oklch(0.86 0.015 165)';

export type BodyRow = {key: string; num: number; y: number; tx?: Tx; alpha?: number; sum?: {label: string; value: ReactNode}};

export const SheetGrid = ({
  left,
  top,
  width,
  bodyH,
  rows,
  formula = '',
  scrollY = 0,
  headerIn = () => 1,
  filterIn = () => 1,
  filterOn,
  frozen = 1,
  tint,
  selected,
  bold = 1,
}: {
  left: number;
  top: number;
  width: number;
  bodyH: number;
  rows: BodyRow[];
  formula?: ReactNode;
  scrollY?: number;
  headerIn?: (i: number) => number; // 0 → 1 per header cell
  filterIn?: (i: number) => number; // 0 → 1 per filter button
  filterOn?: ColKey; // a filter is applied on this column
  frozen?: number; // the frozen line under the header, drawn 0 → 1
  tint?: Partial<Record<ColKey, number>>; // 0–1 highlight per column
  selected?: {x: number; y: number; w: number; h: number}; // sheet px, body coords (y from the body top)
  bold?: number; // 0–1 pulse on the header's weight, for the punch-in
}) => (
  <div style={{position: 'absolute', left, top, width, height: BODY_TOP + bodyH, borderRadius: 22, overflow: 'hidden', background: C.raised, boxShadow: '0 2px 4px oklch(0.3 0.06 168 / 0.08), 0 30px 70px -30px oklch(0.2 0.06 168 / 0.55)', fontFamily: body, color: C.ink}}>
    {/* Formula bar */}
    <div style={{position: 'absolute', left: 0, right: 0, top: 0, height: FORMULA_H, display: 'flex', alignItems: 'center', gap: 14, padding: '0 18px', borderBottom: `1px solid ${LINE}`, fontSize: 22}}>
      <span style={{fontStyle: 'italic', fontWeight: 700, color: C.inkFaint}}>fx</span>
      <span style={{width: 1, alignSelf: 'stretch', margin: '12px 0', background: LINE}} />
      <span style={{fontFamily: 'ui-monospace, Menlo, monospace', fontSize: 21, whiteSpace: 'nowrap'}}>{formula}</span>
    </div>
    {/* Column letters */}
    <div style={{position: 'absolute', left: 0, top: FORMULA_H, height: LETTER_H, width: colX(COLS.length), background: C.sunken, borderBottom: `1px solid ${LINE}`}}>
      {COLS.map((c, i) => (
        <span key={c.key} style={{position: 'absolute', left: colX(i), width: c.w, top: 0, height: LETTER_H, display: 'grid', placeItems: 'center', fontSize: 17, fontWeight: 600, color: C.inkFaint, borderLeft: `1px solid ${LINE}`, boxSizing: 'border-box'}}>
          {String.fromCharCode(65 + i)}
        </span>
      ))}
    </div>
    {/* Body, scrolled under the frozen header */}
    <div style={{position: 'absolute', left: 0, right: 0, top: BODY_TOP, height: bodyH, overflow: 'hidden'}}>
      {COLS.map((c, i) => (tint?.[c.key] ? <div key={c.key} style={{position: 'absolute', left: colX(i), width: c.w, top: 0, bottom: 0, background: `oklch(0.67 0.165 160 / ${(0.14 * tint[c.key]!).toFixed(3)})`}} /> : null))}
      {rows.map((r) => (
        <div key={r.key} style={{position: 'absolute', left: 0, top: r.y - scrollY, height: ROW_H, width: colX(COLS.length), opacity: r.alpha ?? 1, borderBottom: `1px solid ${LINE}`, boxSizing: 'border-box', fontSize: FS, fontVariantNumeric: 'tabular-nums'}}>
          <span style={{position: 'absolute', left: 0, width: RN, top: 0, bottom: 0, display: 'grid', placeItems: 'center', background: C.sunken, fontSize: 17, fontWeight: 600, color: filterOn ? C.transfer : C.inkFaint}}>{r.num}</span>
          {r.tx &&
            COLS.map((c, i) => (
              <span key={c.key} style={{position: 'absolute', left: colX(i), width: c.w, top: 0, bottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'right' in c ? 'flex-end' : 'flex-start', padding: '0 12px', boxSizing: 'border-box', borderLeft: `1px solid ${LINE}`, whiteSpace: 'nowrap', overflow: 'hidden'}}>
                {cell(r.tx!, c.key)}
              </span>
            ))}
          {r.sum && (
            <>
              <span style={{position: 'absolute', left: colX(0), width: COLS[0].w + COLS[1].w, top: 0, bottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', padding: '0 12px', boxSizing: 'border-box', fontWeight: 800, whiteSpace: 'nowrap'}}>{r.sum.label}</span>
              <span style={{position: 'absolute', left: colX(2), width: COLS[2].w, top: 0, bottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', padding: '0 12px', boxSizing: 'border-box', fontWeight: 800, borderTop: `3px double ${C.ink}`}}>{r.sum.value}</span>
            </>
          )}
        </div>
      ))}
      {selected && <div style={{position: 'absolute', left: selected.x, top: selected.y - scrollY, width: selected.w, height: selected.h, border: `3px solid ${C.accentStrong}`, boxSizing: 'border-box'}} />}
    </div>
    {/* Header row: bold, shaded, frozen, a filter button in every cell */}
    <div style={{position: 'absolute', left: 0, top: FORMULA_H + LETTER_H, height: HEAD_H, width: colX(COLS.length)}}>
      <span style={{position: 'absolute', left: 0, width: RN, top: 0, bottom: 0, display: 'grid', placeItems: 'center', background: C.sunken, fontSize: 17, fontWeight: 600, color: C.inkFaint}}>1</span>
      {COLS.map((c, i) => {
        const p = headerIn(i);
        const q = filterIn(i);
        const on = filterOn === c.key;
        return (
          <span key={c.key} style={{position: 'absolute', left: colX(i), width: c.w, top: 0, bottom: 0, display: 'flex', alignItems: 'center', padding: '0 8px 0 12px', boxSizing: 'border-box', background: HEAD_FILL, borderLeft: `1px solid ${LINE}`, opacity: p, transform: `translateY(${(1 - p) * -16}px)`, fontSize: FS, fontWeight: 600 + 200 * bold, whiteSpace: 'nowrap', overflow: 'hidden'}}>
            <span style={{flex: 1, overflow: 'hidden'}}>{c.label}</span>
            <span style={{display: 'grid', placeItems: 'center', width: 26, height: 26, borderRadius: 6, flex: 'none', background: on ? C.accentStrong : C.raised, border: `1px solid ${on ? C.accentStrong : LINE}`, transform: `scale(${q})`, opacity: q}}>
              {on ? <Filter size={14} color="#fff" strokeWidth={2.6} /> : <ChevronDown size={16} color={C.inkSoft} strokeWidth={2.6} />}
            </span>
          </span>
        );
      })}
      <div style={{position: 'absolute', left: 0, bottom: -2, height: 3, width: colX(COLS.length), background: C.inkSoft, transformOrigin: 'left center', transform: `scaleX(${frozen})`}} />
    </div>
  </div>
);
