// The Reports page (ReportsPage.tsx) redrawn at app px (394 wide), and the phone it sits in. Every scene that
// shows the phone uses this geometry, so a relay cut lands on exactly the same pixels.
import {FileSpreadsheet, FileText} from 'lucide-react';
import {lerp, roundK, rupiah} from '../lib/core';
import {APP_W, TabBar} from '../lib/Home';
import {Lucide} from '../lib/lucide';
import {accentInk} from '../lib/motion';
import {C, body} from '../lib/palette';
import {Button, Chips, Field, Input, PANEL, PageHeader} from '../lib/ui';

export {STAGE as PHONE, STAGE_SCREEN_H as SCREEN_H, STAGE_ZOOM as ZOOM, onStage as toScene} from '../lib/Phone';
import {STAGE_SCREEN_H as SCREEN_H} from '../lib/Phone';

// App px of what gets tapped. The header's action sits at its bottom right; the menu drops under it.
export const EXPORT_BTN = {x: 328, y: 106, w: 100, h: 36};
export const MENU = {right: 16, top: 130, w: 188, item: 44};
export const menuItem = (i: number) => ({x: APP_W - MENU.right - MENU.w / 2, y: MENU.top + 4 + MENU.item * i + MENU.item / 2});
export const CHIPS_Y = 200; // centre of the first row of Range chips
export const COUNT_Y = 283; // the "· 20 transactions" line
/** Centre of each Range chip (app px). Custom wraps to a second row at phone width, as in the app. */
export const CHIP_AT: Record<Preset, {x: number; y: number}> = {Month: {x: 70, y: 200}, '3 months': {x: 164, y: 200}, Year: {x: 252, y: 200}, Custom: {x: 73, y: 244}};

export type Preset = 'Month' | '3 months' | 'Year' | 'Custom';
// What each range shows (Oktober 2026 in the header). Month is the export's 20 rows.
export const RANGES: Record<Preset, {from: string; to: string; count: number; income: number; expense: number}> = {
  Month: {from: '1 Okt 2026', to: '31 Okt 2026', count: 20, income: 5_200_000, expense: 3_938_000},
  '3 months': {from: '1 Agu 2026', to: '31 Okt 2026', count: 61, income: 15_600_000, expense: 11_742_000},
  Year: {from: '1 Jan 2026', to: '31 Okt 2026', count: 203, income: 52_000_000, expense: 39_215_000},
  Custom: {from: '1 Jan 2026', to: '31 Okt 2026', count: 203, income: 52_000_000, expense: 39_215_000},
};

const TREND = [0.55, 0.62, 0.5, 0.7, 0.66, 0.58, 0.74, 0.69, 0.61, 0.8, 0.72, 0.76];
const SPEND = [
  ['Makan', 1_420_000, 'tangerine'],
  ['Belanja', 1_088_000, 'bubblegum'],
  ['Tagihan', 750_000, 'grape'],
  ['Transport', 680_000, 'sky'],
] as const;

const Stat = ({label, value, sign, tone, icon, fresh}: {label: string; value: number; sign: string; tone: 'income' | 'expense' | 'transfer'; icon: 'arrowDownLeft' | 'arrowUpRight' | 'arrowLeftRight'; fresh: number}) => (
  <div style={{...PANEL, borderRadius: 16, padding: 12, minWidth: 0}}>
    <span style={{display: 'grid', placeItems: 'center', width: 28, height: 28, borderRadius: 8, background: C[`${tone}Soft`]}}>
      <Lucide name={icon} size={16} color={C[tone]} strokeWidth={2.6} />
    </span>
    <div style={{marginTop: 8, fontSize: 12, fontWeight: 600, color: C.inkSoft}}>{label}</div>
    <div style={{marginTop: 2, fontSize: 13, fontWeight: 800, color: accentInk(fresh), whiteSpace: 'nowrap', fontVariantNumeric: 'tabular-nums'}}>
      {sign}
      {rupiah(value)}
    </div>
  </div>
);

/**
 * The page. `range` is the chosen chip and `shown` the figures on screen (callers count them between ranges);
 * `lit` glows chips as the voice names them; `custom` opens the From/To fields; `menu` drops the Export menu.
 */
export const Reports = ({
  range,
  shown,
  fresh = 0,
  lit,
  custom = 0,
  menu = 0,
  menuLit = {},
  press = 1,
  countMark,
}: {
  range: Preset;
  shown: {count: number; income: number; expense: number; from: string; to: string};
  fresh?: number;
  lit?: Partial<Record<Preset, number>>;
  custom?: number;
  menu?: number;
  menuLit?: {csv?: number; xlsx?: number};
  press?: number;
  countMark?: (text: string) => React.ReactNode;
}) => {
  const count = `· ${shown.count} transactions`;
  return (
    <div style={{position: 'absolute', left: 0, top: 0, width: APP_W, height: SCREEN_H, fontFamily: body, color: C.ink, background: C.surface}}>
      <div style={{padding: '48px 16px 16px', display: 'grid', gap: 16}}>
        <PageHeader
          title="Reports"
          subtitle="Every transaction in the range, dated in Jakarta time."
          action={
            <Button variant="secondary" size="sm" icon="download" style={{transform: `scale(${press})`}}>
              Export
            </Button>
          }
        />
        <div style={{...PANEL, padding: 16, display: 'grid', gap: 12}}>
          <div style={{fontSize: 13, fontWeight: 600, color: C.inkSoft}}>Range</div>
          <Chips options={(['Month', '3 months', 'Year', 'Custom'] as const).map((label) => ({label}))} value={range} lit={lit} />
          <div style={{fontSize: 14, color: C.inkSoft}}>
            <span style={{fontWeight: 600, color: C.ink}}>
              {shown.from} to {shown.to}
            </span>{' '}
            {countMark ? countMark(count) : count}
          </div>
          {custom > 0.01 && (
            <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, height: 76 * custom, overflow: 'hidden', opacity: custom}}>
              <Field label="From">
                <Input value="2026-01-01" icon="calendar" />
              </Field>
              <Field label="To">
                <Input value="2026-10-31" icon="calendar" />
              </Field>
            </div>
          )}
        </div>
        <div style={{display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8}}>
          <Stat label="Income" value={shown.income} sign="+" tone="income" icon="arrowDownLeft" fresh={fresh} />
          <Stat label="Expense" value={shown.expense} sign="−" tone="expense" icon="arrowUpRight" fresh={fresh} />
          <Stat label="Net" value={shown.income - shown.expense} sign="+" tone="transfer" icon="arrowLeftRight" fresh={fresh} />
        </div>
        <div style={{...PANEL, padding: 16}}>
          <div style={{fontSize: 15, fontWeight: 700}}>Monthly trend</div>
          <div style={{marginTop: 2, fontSize: 12, color: C.inkSoft}}>The 12 months ending Oktober 2026.</div>
          <div style={{marginTop: 14, height: 96, display: 'flex', alignItems: 'flex-end', gap: 6}}>
            {TREND.map((h, i) => (
              <div key={i} style={{flex: 1, display: 'flex', alignItems: 'flex-end', gap: 2, height: '100%'}}>
                <div style={{flex: 1, height: `${h * 100}%`, borderRadius: 3, background: C.chartIncome, opacity: i === 11 ? 1 : 0.55}} />
                <div style={{flex: 1, height: `${h * 78}%`, borderRadius: 3, background: C.chartExpense, opacity: i === 11 ? 1 : 0.55}} />
              </div>
            ))}
          </div>
        </div>
        <div style={{...PANEL, padding: 16, display: 'grid', gap: 10}}>
          <div style={{fontSize: 15, fontWeight: 700}}>Spending by category</div>
          {SPEND.map(([name, v]) => (
            <div key={name} style={{display: 'grid', gap: 4}}>
              <div style={{display: 'flex', justifyContent: 'space-between', fontSize: 13, fontWeight: 600}}>
                <span>{name}</span>
                <span style={{fontVariantNumeric: 'tabular-nums'}}>{rupiah(v)}</span>
              </div>
              <div style={{height: 8, borderRadius: 999, background: C.sunken}}>
                <div style={{width: `${(v / 1_420_000) * 100}%`, height: '100%', borderRadius: 999, background: C.chartExpense}} />
              </div>
            </div>
          ))}
        </div>
      </div>
      <TabBar active="" />
      {/* The Export menu: CSV · Excel (.xlsx). */}
      {menu > 0.01 && (
        <div style={{position: 'absolute', right: MENU.right, top: MENU.top, width: MENU.w, ...PANEL, borderRadius: 16, padding: 4, boxSizing: 'border-box', opacity: menu, transform: `translateY(${(1 - menu) * -8}px)`, transformOrigin: 'top right'}}>
          {[
            {label: 'CSV', Icon: FileText, hot: menuLit.csv ?? 0},
            {label: 'Excel (.xlsx)', Icon: FileSpreadsheet, hot: menuLit.xlsx ?? 0},
          ].map(({label, Icon, hot}) => (
            <div key={label} style={{display: 'flex', alignItems: 'center', gap: 10, height: MENU.item, padding: '0 12px', borderRadius: 12, fontSize: 14, fontWeight: 600, background: `oklch(0.67 0.165 160 / ${(0.22 * hot).toFixed(3)})`}}>
              <Icon size={16} color={C.inkSoft} />
              {label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

/** Figures counting from one range to the next: the change lands on E.type over `p`. */
export const between = (a: Preset, b: Preset, p: number) => ({
  ...RANGES[b],
  count: Math.round(lerp(RANGES[a].count, RANGES[b].count, p)),
  income: roundK(lerp(RANGES[a].income, RANGES[b].income, p)),
  expense: roundK(lerp(RANGES[a].expense, RANGES[b].expense, p)),
});
