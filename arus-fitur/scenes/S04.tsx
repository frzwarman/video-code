// S4 — Anggaran: the Budgets page. A monthly limit for Makan is set in the sheet, its card lands and fills as
// the month's spending comes in; next month starts empty until "Copy last month" brings the budgets back.
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {type CameraKey, type Cue, lerp, prog, roundK, rupiah} from '../../lib/core';
import {Marker, YELLOW_MARK} from '../../lib/Fx';
import {E, Tap, hitPulse, pressScale, punch, usePhoneIn} from '../../lib/motion';
import {APP_W, TabBar} from '../../lib/Home';
import {CATEGORY, Lucide, Tile, type IconName} from '../../lib/lucide';
import {C, body} from '../../lib/palette';
import {Phone, bezel} from '../../lib/Phone';
import {Button, Field, Input, PANEL, PageHeader, Sheet, caretOn, newest, typed} from '../../lib/ui';
import {cue} from '../voice';

// VO: "Setiap kategori bisa punya batas bulanan." | "Isi nominalnya," | "dan Arus menghitung SISANYA sepanjang bulan."
//     | "Bulan depan?" | "Tinggal SALIN anggaran bulan lalu."
const TAP_SET = cue('S4', 0, 0.75);
const SHEET_UP = TAP_SET + 8;
const LIMIT_AT = cue('S4', 1, 0.1); // "2.000.000" is typed
const TAP_SAVE = cue('S4', 2, 0.02);
const SHEET_DOWN = TAP_SAVE + 8;
const CARD_AT = SHEET_DOWN + 14; // the Makan card lands
const FILL_AT = cue('S4', 2, 0.4); // "SISANYA": spending comes in, the bar fills, the remainder counts down
const FILL_DUR = 60;
const MARK_AT = FILL_AT + FILL_DUR;
const NOV_AT = cue('S4', 3, 0.15); // "Bulan depan?": next month
const FLIP_AT = NOV_AT + 6;
const TAP_COPY = cue('S4', 4, 0.3); // "SALIN"
const COPIED_AT = TAP_COPY + 12;
const TOAST_AT = COPIED_AT + 24;

const PHONE = {left: 240, top: 300, w: 600, h: 1300};
const BZ = bezel(PHONE.w, PHONE.h);
const ZOOM = BZ.screenW / APP_W;
const SCREEN_H = BZ.screenH / ZOOM;
const toScene = (x: number, y: number) => ({x: PHONE.left + BZ.inset + x * ZOOM, y: PHONE.top + BZ.inset + y * ZOOM});
const SET_BTN = toScene(255, 152);
const COPY_BTN = toScene(96, 152);
const NEXT_BTN = toScene(286, 200);
const SAVE_BTN = toScene(254, SCREEN_H - 52);

type Row = {name: string; limit: number; spent: number};
const stateOf = (r: Row) => (r.spent > r.limit ? 'over' : r.spent >= r.limit * 0.8 ? 'close' : 'ok');
// The app's STATE_LOOK: the words and the icon say it, colour only repeats it.
const LOOK: Record<ReturnType<typeof stateOf>, {bar: string; text: string; icon: IconName}> = {
  ok: {bar: C.accent, text: C.inkSoft, icon: 'circleCheck'},
  close: {bar: C.warnBar, text: C.warn, icon: 'circleAlert'},
  over: {bar: C.expense, text: C.expense, icon: 'triangleAlert'},
};
const OCT: Row[] = [
  {name: 'Transport', limit: 400_000, spent: 240_000},
  {name: 'Belanja', limit: 750_000, spent: 710_000},
];
const MAKAN = {name: 'Makan', limit: 2_000_000};

export const camera: CameraKey[] = [
  {at: 0, zoom: 1.2, x: 540, y: 620, dur: 1},
  {at: SHEET_UP + 6, zoom: 1.45, x: 540, y: 1200},
  {at: SHEET_DOWN, zoom: 1.3, x: 540, y: 900},
  {at: NOV_AT - 12, zoom: 1.35, x: 540, y: 640},
  // "SALIN": hard cut in on Copy last month as it is pressed, back out as the budgets fly back.
  ...punch(TAP_COPY - 4, COPY_BTN.x, COPY_BTN.y, {zoom: 1.35, x: 540, y: 640}, 2.4, 22),
  {at: COPIED_AT + 10, zoom: 1.2, x: 540, y: 820},
];

export const sfx: Cue[] = [
  {at: TAP_SET, sound: 'tap', volume: 0.8},
  {at: SHEET_UP, sound: 'whoosh', volume: 0.35},
  ...[0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => ({at: LIMIT_AT + i * 4, sound: 'tick', volume: 0.3})),
  {at: TAP_SAVE, sound: 'tap', volume: 0.8},
  {at: SHEET_DOWN, sound: 'whoosh', volume: 0.3},
  {at: CARD_AT, sound: 'snap', volume: 0.7},
  ...[0, 1, 2, 3, 4, 5, 6].map((i) => ({at: FILL_AT + 6 + i * 8, sound: 'tick', volume: 0.3})),
  {at: MARK_AT, sound: 'ding', volume: 0.5},
  {at: NOV_AT, sound: 'tap', volume: 0.6},
  {at: FLIP_AT, sound: 'whoosh', volume: 0.3},
  {at: TAP_COPY, sound: 'tap', volume: 0.8},
  ...[0, 1, 2].map((i) => ({at: COPIED_AT + i * 6, sound: 'click', volume: 0.4})),
  {at: TOAST_AT, sound: 'ding', volume: 0.5},
];

const BudgetCard = ({row, mark}: {row: Row; mark?: {at: number; f: number}}) => {
  const look = LOOK[stateOf(row)];
  const pct = Math.min(100, (row.spent / row.limit) * 100);
  const cat = CATEGORY[row.name];
  const left = `${rupiah(row.limit - row.spent)} left`;
  return (
    <div style={{...PANEL, padding: 14}}>
      <div style={{display: 'flex', alignItems: 'center', gap: 12}}>
        <Tile icon={cat.icon} tone={cat.tone} size="md" />
        <div style={{minWidth: 0, flex: 1}}>
          <div style={{fontSize: 15, fontWeight: 700, color: C.ink}}>{row.name}</div>
          <div style={{marginTop: 2, fontSize: 13, color: C.inkSoft, fontVariantNumeric: 'tabular-nums'}}>
            <span style={{color: C.ink, fontWeight: 700}}>{rupiah(row.spent)}</span> of {rupiah(row.limit)}
          </div>
        </div>
      </div>
      <div style={{marginTop: 12, height: 10, borderRadius: 999, background: C.sunken, overflow: 'hidden'}}>
        <div style={{width: `${pct}%`, height: '100%', borderRadius: 999, background: look.bar}} />
      </div>
      <div style={{marginTop: 8, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 700, color: look.text, fontVariantNumeric: 'tabular-nums'}}>
          <Lucide name={look.icon} size={14} color={look.text} />
          <span>
            {mark ? (
              <Marker at={mark.at} f={mark.f} color={YELLOW_MARK}>
                {left}
              </Marker>
            ) : (
              left
            )}
            {stateOf(row) === 'close' ? ', almost there' : ''}
          </span>
        </div>
        <div style={{display: 'flex', gap: 12}}>
          <Lucide name="pencil" size={16} color={C.inkSoft} />
          <Lucide name="trash" size={16} color={C.inkSoft} />
        </div>
      </div>
    </div>
  );
};

// The month at a glance: a ring for the whole and three figures.
const R = 43;
const CIRC = 2 * Math.PI * R;
const Summary = ({rows}: {rows: Row[]}) => {
  const budgeted = rows.reduce((s, r) => s + r.limit, 0);
  const spent = rows.reduce((s, r) => s + r.spent, 0);
  const states = rows.map(stateOf);
  const over = states.filter((s) => s === 'over').length;
  const tone = over ? 'over' : states.includes('close') ? 'close' : 'ok';
  const pct = Math.round((spent / budgeted) * 100);
  const filled = Math.min(pct, 100) / 100;
  return (
    <div style={{...PANEL, padding: 16, display: 'flex', alignItems: 'center', gap: 16}}>
      <div style={{position: 'relative', width: 96, height: 96, display: 'grid', placeItems: 'center', flex: 'none'}}>
        <svg viewBox="0 0 96 96" width={96} height={96} style={{position: 'absolute', inset: 0}}>
          <circle cx={48} cy={48} r={R} fill="none" strokeWidth={10} stroke={C.sunken} />
          {filled > 0 && <circle cx={48} cy={48} r={R} fill="none" strokeWidth={10} strokeLinecap="round" stroke={LOOK[tone].bar} strokeDasharray={CIRC} strokeDashoffset={CIRC * (1 - filled)} transform="rotate(-90 48 48)" />}
        </svg>
        <div style={{position: 'relative', textAlign: 'center'}}>
          <div style={{fontSize: 20, fontWeight: 800, color: C.ink, lineHeight: 1, fontVariantNumeric: 'tabular-nums'}}>{pct}%</div>
          <div style={{marginTop: 4, fontSize: 11, fontWeight: 600, color: C.inkSoft, lineHeight: 1}}>spent</div>
        </div>
      </div>
      <div style={{display: 'grid', gap: 8, minWidth: 0, flex: 1}}>
        {[
          ['Budgeted', rupiah(budgeted)],
          ['Spent', rupiah(spent)],
          ['Over budget', String(over)],
        ].map(([label, value]) => (
          <div key={label}>
            <div style={{fontSize: 12, fontWeight: 600, color: C.inkSoft}}>{label}</div>
            <div style={{marginTop: 1, fontSize: 15, fontWeight: 800, color: C.ink, lineHeight: 1.2, fontVariantNumeric: 'tabular-nums'}}>
              {value}
              {label === 'Over budget' && <span style={{marginLeft: 4, fontWeight: 600, color: C.inkSoft}}>of {rows.length}</span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export const Scene = () => {
  const f = useCurrentFrame();
  const phoneIn = usePhoneIn();
  const up = prog(f, SHEET_UP, 44, E.glide) * (1 - prog(f, SHEET_DOWN, 24, E.exit));
  const limit = typed('2.000.000', f, LIMIT_AT, 14);
  const typing = f >= LIMIT_AT && f < LIMIT_AT + 50;
  const cardIn = prog(f, CARD_AT, 26, E.out);
  const makanSpent = roundK(lerp(0, 1_420_000, prog(f, FILL_AT, FILL_DUR, E.glide)));
  const november = f >= NOV_AT + 3;
  const monthIn = prog(f, NOV_AT + 3, 14);
  const out = prog(f, FLIP_AT, 16, E.exit); // October's cards leave, accelerating…
  const copied = f >= COPIED_AT; // …and come back for November, untouched
  const rows: Row[] = copied
    ? [{...MAKAN, spent: 0}, ...OCT.map((r) => ({...r, spent: 0}))]
    : [...(f >= CARD_AT ? [{...MAKAN, spent: makanSpent}] : []), ...OCT];
  const list = copied || f < FLIP_AT + 14;
  const empty = !copied && f >= FLIP_AT + 14;
  const emptyIn = prog(f, FLIP_AT + 14, 20);
  const copyGlow = hitPulse(f, TAP_COPY);
  const toast = prog(f, TOAST_AT, 22, E.out);

  return (
    <AbsoluteFill>
      <Phone w={PHONE.w} h={PHONE.h} screen={C.surface} variant="android" style={{left: PHONE.left, top: PHONE.top, borderRadius: 96, ...phoneIn}}>
        <div style={{position: 'absolute', left: 0, top: 0, width: APP_W, height: SCREEN_H, transformOrigin: 'top left', transform: `scale(${ZOOM})`, fontFamily: body, color: C.ink}}>
          <div style={{padding: '48px 16px 16px', display: 'grid', gap: 16}}>
            <div>
              <PageHeader title="Budgets" subtitle={`${november ? 'November' : 'Oktober'} 2026. Transfers between your own accounts never count as spending.`} />
              <div style={{display: 'flex', gap: 8, marginTop: 12}}>
                <Button variant="secondary" size="sm" icon="copy" style={{outline: copyGlow > 0.02 ? `2px solid oklch(0.67 0.165 160 / ${copyGlow.toFixed(3)})` : undefined, outlineOffset: 3, transform: `scale(${pressScale(f, TAP_COPY)})`}}>
                  Copy last month
                </Button>
                <Button variant="primary" size="sm" icon="plus" style={{transform: `scale(${pressScale(f, TAP_SET)})`}}>
                  Set a budget
                </Button>
              </div>
              {/* The phone's month bar: arrows step one month. */}
              <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 12, height: 36}}>
                <span style={{display: 'grid', placeItems: 'center', width: 36, height: 36}}>
                  <Lucide name="chevronLeft" size={18} color={C.inkSoft} />
                </span>
                <span style={{minWidth: 130, textAlign: 'center', fontSize: 15, fontWeight: 700, color: C.ink, opacity: november ? monthIn : 1, transform: `translateX(${november ? (1 - monthIn) * 16 : 0}px)`}}>{november ? 'November' : 'Oktober'} 2026</span>
                <span style={{display: 'grid', placeItems: 'center', width: 36, height: 36}}>
                  <Lucide name="chevronRight" size={18} color={C.inkSoft} />
                </span>
              </div>
            </div>
            {list && (
              <div style={{opacity: copied ? 1 : 1 - out, transform: `translateX(${copied ? 0 : -out * 60}px)`}}>
                <Summary rows={rows} />
              </div>
            )}
            {list && (
              <div style={{display: 'grid', gap: 10}}>
                {rows.map((row, i) => {
                  const inP = copied ? prog(f, COPIED_AT + i * 4, 26, E.out) : row.name === 'Makan' ? cardIn : 1;
                  const fade = copied ? prog(f, COPIED_AT + i * 4, 10, E.smooth) : (row.name === 'Makan' ? prog(f, CARD_AT, 8) : 1) * (1 - out);
                  return (
                    <div key={row.name} style={{opacity: fade, transform: copied ? `translateX(${(1 - inP) * -420}px)` : row.name === 'Makan' ? `translateY(${(1 - inP) * 30}px) scale(${0.94 + 0.06 * inP})` : `translateX(${-out * 420 * (1 + i * 0.15)}px)`}}>
                      <BudgetCard row={row} mark={row.name === 'Makan' && !copied ? {at: MARK_AT, f} : undefined} />
                    </div>
                  );
                })}
              </div>
            )}
            {empty && (
              <div style={{...PANEL, padding: '28px 24px', display: 'grid', justifyItems: 'center', textAlign: 'center', gap: 10, opacity: emptyIn, transform: `translateY(${(1 - emptyIn) * 20}px)`}}>
                <Tile icon="target" tone="slate" size="lg" />
                <div style={{fontSize: 16, fontWeight: 800, color: C.ink}}>No budgets for November 2026</div>
                <div style={{fontSize: 13, color: C.inkSoft, lineHeight: 1.4}}>Pick an expense category and a monthly limit. Progress updates as you record expenses.</div>
                <Button variant="primary" size="sm" icon="plus">
                  Set a budget
                </Button>
              </div>
            )}
          </div>
          <TabBar active="Budgets" />
          {f >= TOAST_AT && (
            <div style={{position: 'absolute', left: 16, right: 16, bottom: 100, ...PANEL, borderRadius: 16, padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 12, opacity: prog(f, TOAST_AT, 8), transform: `translateY(${(1 - toast) * 40}px)`}}>
              <span style={{display: 'grid', placeItems: 'center', width: 32, height: 32, borderRadius: '50%', background: C.incomeSoft}}>
                <Lucide name="circleCheck" size={18} color={C.income} />
              </span>
              <div style={{fontSize: 14, fontWeight: 700}}>Copied 3 budgets</div>
            </div>
          )}
          <div style={{position: 'absolute', inset: 0, background: `oklch(0 0 0 / ${(0.45 * up).toFixed(3)})`}} />
          <Sheet up={up} title="Set a budget" description="Monthly limit for Oktober 2026.">
            <Field label="Category">
              <div style={{display: 'flex', alignItems: 'center', gap: 10, height: 44, padding: '0 12px', borderRadius: 14, background: C.raised, border: `1px solid ${C.lineStrong}`, boxSizing: 'border-box'}}>
                <Tile icon={CATEGORY.Makan.icon} tone={CATEGORY.Makan.tone} size="sm" scale={0.8} />
                <span style={{flex: 1, fontSize: 16, color: C.ink}}>Makan</span>
                <Lucide name="chevronDown" size={16} color={C.inkFaint} />
              </div>
            </Field>
            <Field label="Monthly limit" required>
              <Input value={limit} placeholder="1.500.000" prefix="Rp" focus={typing ? 1 : 0} caret={typing && caretOn(f)} fresh={newest('2.000.000', f, LIMIT_AT, 14)} />
              <div style={{fontSize: 12, color: C.inkSoft}}>Whole rupiah.</div>
            </Field>
            <div style={{display: 'flex', gap: 8, marginTop: 4}}>
              <Button variant="ghost">Cancel</Button>
              <Button variant="primary" size="lg" style={{flex: 1, transform: `scale(${pressScale(f, TAP_SAVE)})`}}>
                Set budget
              </Button>
            </div>
          </Sheet>
        </div>
      </Phone>
      <Tap f={f} at={TAP_SET} x={SET_BTN.x} y={SET_BTN.y} w={125 * ZOOM} h={36 * ZOOM} />
      <Tap f={f} at={TAP_SAVE} x={SAVE_BTN.x} y={SAVE_BTN.y} w={251 * ZOOM} h={48 * ZOOM} />
      <Tap f={f} at={NOV_AT} x={NEXT_BTN.x} y={NEXT_BTN.y} w={36 * ZOOM} h={36 * ZOOM} />
      <Tap f={f} at={TAP_COPY} x={COPY_BTN.x} y={COPY_BTN.y} w={160 * ZOOM} h={36 * ZOOM} />
    </AbsoluteFill>
  );
};
