// S7 — The real Arus dashboard (DashboardPage.tsx, phone layout, hardcoded October figures) in a phone.
// The camera goes where the voice goes: Income, Expenses, then scrolls to a transfer in Recent transactions.
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {type CameraKey, type Cue, cue, fadeUp, inOut, prog, roundK, rupiah} from '../core';
import {Phone} from '../Phone';
import {C, body, display, glass} from '../palette';

// VO: "Dasbor menunjukkan ALUR uangmu:" | "pemasukan," | "pengeluaran," | "dan transfer antar-rekening."
const INCOME_AT = cue('S7', 1);
const EXPENSE_AT = cue('S7', 2);
const TRANSFER_AT = cue('S7', 3);
const SCROLL_AT = TRANSFER_AT - 20;

const PHONE = {left: 240, top: 300, w: 600, h: 1300};
const APP_W = 394; // the app laid out at phone width, then scaled up to fill the screen
const ZOOM = (PHONE.w - 28) / APP_W;
const SCROLL = 637; // app px: brings the transfer row to the upper middle of the screen
const toScene = (x: number, y: number) => ({x: PHONE.left + 14 + x * ZOOM, y: PHONE.top + 14 + y * ZOOM});
const INCOME = toScene(197, 204);
const EXPENSE = toScene(197, 296);
const TRANSFER = toScene(197, 1037 - SCROLL);

export const camera: CameraKey[] = [
  {at: INCOME_AT - 8, zoom: 1.9, x: INCOME.x, y: INCOME.y, dur: 30},
  {at: EXPENSE_AT - 8, zoom: 1.9, x: EXPENSE.x, y: EXPENSE.y, dur: 30},
  {at: SCROLL_AT, zoom: 1, dur: 30},
  {at: TRANSFER_AT + 24, zoom: 1.7, x: TRANSFER.x, y: TRANSFER.y, dur: 30},
];

export const sfx: Cue[] = [
  {at: INCOME_AT, sound: 'click', volume: 0.5},
  {at: EXPENSE_AT, sound: 'click', volume: 0.5},
  {at: SCROLL_AT, sound: 'whoosh', volume: 0.35},
  {at: TRANSFER_AT + 30, sound: 'snap', volume: 0.6},
];

// App tokens (src/index.css dark) in app px.
const card = {...glass, borderRadius: 24, boxShadow: '0 1px 2px oklch(0 0 0 / 0.3), 0 12px 32px -14px oklch(0 0 0 / 0.55)'};
const T = {sm: 14, xs: 12, lg: 18, xl: 20, xxl: 24};
const INC = '#0d9488';
const EXP = '#ef4444';
const MONTHS = ['Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt'];
const SERIES = [
  [5_200_000, 3_650_000],
  [5_200_000, 4_120_000],
  [4_800_000, 3_380_000],
  [5_200_000, 3_900_000],
  [5_400_000, 4_210_000],
  [5_200_000, 3_938_000],
];
const SLICES = [
  ['Makan', 1_420_000, '#0d9488'],
  ['Belanja', 1_088_000, '#0ea5e9'],
  ['Tagihan', 750_000, '#f59e0b'],
  ['Transport', 680_000, '#ef4444'],
] as const;
const RECENT = [
  {type: 'transfer', payee: 'Transfer', sub: '7 Okt 2026 · BCA → E-wallet', amount: 150_000},
  {type: 'expense', payee: 'KEDAI KOPI', sub: '7 Okt 2026 · Makan', amount: 152_500},
  {type: 'expense', payee: 'Listrik', sub: '5 Okt 2026 · Tagihan', amount: 350_000},
  {type: 'expense', payee: 'Bensin', sub: '4 Okt 2026 · Transport', amount: 100_000},
  {type: 'income', payee: 'Gaji', sub: '1 Okt 2026 · Gaji', amount: 5_200_000},
] as const;
const BUDGETS = [
  ['Makan', 1_420_000, 2_000_000],
  ['Transport', 680_000, 800_000],
  ['Hiburan', 392_000, 400_000],
] as const;
const TONE = {income: C.income, expense: C.expense, transfer: C.transfer};
const PREFIX = {income: '+', expense: '−', transfer: ''};
const ARROW = {
  income: 'M17 7L7 17M7 9v8h8', // arrow down-left
  expense: 'M7 17L17 7M9 7h8v8', // arrow up-right
  transfer: 'M4 8h16l-4-4M20 16H4l4 4', // arrow left-right
};

const Card = ({title, badge, link, children, top}: {title: string; badge?: string; link?: boolean; children: React.ReactNode; top?: boolean}) => (
  <div style={{...card, marginTop: top ? 0 : 16}}>
    <div style={{display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, padding: 16}}>
      <h2 style={{margin: 0, fontSize: T.sm, fontWeight: 600, color: C.ink}}>{title}</h2>
      {badge && <span style={{fontSize: T.xs, fontWeight: 600, color: C.inkSoft, background: C.sunken, padding: '2px 8px', borderRadius: 999}}>{badge}</span>}
      {link && <span style={{fontSize: T.xs, fontWeight: 600, color: C.accent}}>All →</span>}
    </div>
    <div style={{padding: '0 16px 16px'}}>{children}</div>
  </div>
);

const Stat = ({label, value, tone, emphasis, lit, f, at}: {label: string; value: number; tone?: string; emphasis?: boolean; lit?: number; f: number; at: number}) => (
  <div style={{...card, padding: 16, position: 'relative', ...fadeUp(prog(f, at, 20), 16)}}>
    <p style={{margin: 0, fontSize: T.xs, fontWeight: 500, color: C.inkSoft}}>{label}</p>
    <p style={{margin: '4px 0 0', fontSize: emphasis ? T.xxl : T.lg, fontWeight: 600, fontFamily: emphasis ? display : body, color: tone ?? C.ink, fontVariantNumeric: 'tabular-nums'}}>
      {rupiah(roundK(value * prog(f, at + 4, 26)))}
    </p>
    {lit !== undefined && <div style={{position: 'absolute', inset: -2, borderRadius: 26, border: `2px solid ${C.highlight}`, opacity: lit}} />}
  </div>
);

const Chart = ({f}: {f: number}) => {
  const w = 362;
  const h = 224;
  const max = 6_000_000;
  const y = (v: number) => 8 + (h - 30 - 8) * (1 - v / max);
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{display: 'block'}}>
      {[0, 2, 4, 6].map((m) => (
        <g key={m}>
          <line x1={44} x2={w - 4} y1={y(m * 1e6)} y2={y(m * 1e6)} stroke={C.ink} strokeOpacity={0.15} />
          <text x={38} y={y(m * 1e6) + 4} fontSize={12} fill={C.inkSoft} textAnchor="end" fontFamily={body}>{m === 0 ? '0' : `${m} jt`}</text>
        </g>
      ))}
      {SERIES.map(([inc, exp], i) => {
        const gx = 56 + i * 52;
        const p = prog(f, 8 + i * 5, 30);
        const bar = (v: number, x: number, color: string) => {
          const top = y(v * p);
          return <rect x={x} y={top} width={18} height={y(0) - top} rx={4} fill={color} />;
        };
        return (
          <g key={i}>
            {bar(inc, gx, INC)}
            {bar(exp, gx + 22, EXP)}
            <text x={gx + 20} y={h - 8} fontSize={12} fill={C.inkSoft} textAnchor="middle" fontFamily={body}>{MONTHS[i]}</text>
          </g>
        );
      })}
    </svg>
  );
};

const Donut = ({f}: {f: number}) => {
  const total = SLICES.reduce((a, s) => a + s[1], 0);
  const r = 56;
  const circ = 2 * Math.PI * r;
  let offset = 0;
  return (
    <svg width={160} height={160} viewBox="0 0 160 160" style={{display: 'block', margin: '0 auto'}}>
      {SLICES.map(([name, value, color], i) => {
        const len = (value / total) * circ * prog(f, 20 + i * 8, 30);
        const el = <circle key={name} cx={80} cy={80} r={r} fill="none" stroke={color} strokeWidth={24} strokeDasharray={`${len} ${circ}`} strokeDashoffset={-offset} transform="rotate(-90 80 80)" />;
        offset += (value / total) * circ;
        return el;
      })}
    </svg>
  );
};

const Dashboard = ({f}: {f: number}) => {
  const incomeLit = prog(f, INCOME_AT, 10) * (1 - prog(f, EXPENSE_AT - 6, 10));
  const expenseLit = prog(f, EXPENSE_AT, 10) * (1 - prog(f, SCROLL_AT, 10));
  const transferLit = prog(f, TRANSFER_AT + 30, 12);
  return (
    <div style={{width: APP_W, padding: '16px 16px 24px', boxSizing: 'border-box', fontFamily: body, color: C.ink}}>
      <h1 style={{margin: 0, fontSize: T.xl, fontWeight: 600, letterSpacing: -0.3}}>Keluarga</h1>
      <p style={{margin: '2px 0 16px', fontSize: T.sm, color: C.inkSoft}}>Oktober 2026</p>
      <div style={{display: 'grid', gap: 12}}>
        <Stat label="Total balance" value={947_000} emphasis f={f} at={0} />
        <Stat label="Income" value={5_200_000} tone={C.income} f={f} at={6} lit={incomeLit} />
        <Stat label="Expenses" value={3_938_000} tone={C.expense} f={f} at={12} lit={expenseLit} />
        <Stat label="Net" value={1_262_000} tone={C.income} f={f} at={18} />
      </div>
      <div style={{marginTop: 16}}>
        <Card title="Income and expenses" badge="Last 6 months" top>
          <Chart f={f} />
          <p style={{margin: '8px 0 0', fontSize: T.xs, color: C.inkFaint}}>Left bar of each pair is income, right bar is expenses. Hover for exact figures.</p>
        </Card>
      </div>
      <Card title="Accounts" link>
        {[
          ['Tunai', 450_000],
          ['BCA', 312_000],
          ['E-wallet', 185_000],
        ].map(([n, v]) => (
          <div key={n} style={{display: 'flex', justifyContent: 'space-between', gap: 12, fontSize: T.sm, padding: '4px 0'}}>
            <span>{n}</span>
            <span style={{fontWeight: 500, fontVariantNumeric: 'tabular-nums'}}>{rupiah(v as number)}</span>
          </div>
        ))}
      </Card>
      <Card title="Recent transactions" link>
        {RECENT.map((tx, i) => (
          <div key={tx.payee} style={{display: 'flex', alignItems: 'center', gap: 12, padding: '10px 6px', margin: '0 -6px', borderRadius: 12, borderTop: i ? `1px solid ${C.line}` : undefined, background: i === 0 ? `oklch(0.76 0.12 250 / ${(0.18 * transferLit).toFixed(3)})` : undefined}}>
            <span style={{width: 32, height: 32, borderRadius: 8, background: C.sunken, display: 'grid', placeItems: 'center', flex: 'none'}}>
              <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke={TONE[tx.type]} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <path d={ARROW[tx.type]} />
              </svg>
            </span>
            <div style={{flex: 1, minWidth: 0}}>
              <p style={{margin: 0, fontSize: T.sm, fontWeight: 500, whiteSpace: 'nowrap'}}>{tx.payee}</p>
              <p style={{margin: 0, fontSize: T.xs, color: C.inkSoft, whiteSpace: 'nowrap'}}>{tx.sub}</p>
            </div>
            <span style={{fontSize: T.sm, fontWeight: 500, color: TONE[tx.type], fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap'}}>
              {PREFIX[tx.type]}{rupiah(tx.amount)}
            </span>
          </div>
        ))}
      </Card>
      <Card title="Where it went">
        <Donut f={f} />
        <ul style={{listStyle: 'none', margin: '12px 0 0', padding: 0, display: 'grid', gap: 6}}>
          {SLICES.map(([name, value, color]) => (
            <li key={name} style={{display: 'flex', alignItems: 'center', gap: 8, fontSize: T.sm}}>
              <span style={{width: 10, height: 10, borderRadius: '50%', background: color, flex: 'none'}} />
              <span style={{flex: 1, color: C.inkSoft}}>{name}</span>
              <span style={{fontSize: T.xs, fontWeight: 500, fontVariantNumeric: 'tabular-nums'}}>{rupiah(value)}</span>
            </li>
          ))}
        </ul>
      </Card>
      <Card title="Budgets" link>
        <div style={{display: 'grid', gap: 16}}>
          {BUDGETS.map(([name, spent, amount]) => {
            const pct = Math.round((spent / amount) * 100);
            const tone = pct >= 100 ? C.expense : pct >= 80 ? C.warn : C.accent;
            return (
              <div key={name}>
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 8}}>
                  <span style={{fontSize: T.sm, fontWeight: 500}}>{name}</span>
                  <span style={{fontSize: T.xs, color: C.inkSoft, fontVariantNumeric: 'tabular-nums'}}>{pct}%</span>
                </div>
                <div style={{height: 8, borderRadius: 999, background: C.sunken, overflow: 'hidden', marginTop: 6}}>
                  <div style={{width: `${pct}%`, height: '100%', borderRadius: 999, background: tone}} />
                </div>
                <p style={{margin: '4px 0 0', fontSize: T.xs, color: C.inkSoft}}>
                  {rupiah(spent)} of {rupiah(amount)} · {pct >= 100 ? 'Over budget' : pct >= 80 ? 'Approaching limit' : 'On track'}
                </p>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
};

export const Scene = () => {
  const f = useCurrentFrame();
  const phoneIn = prog(f, 0, 26);
  const scroll = SCROLL * prog(f, SCROLL_AT, 44, inOut);
  return (
    <AbsoluteFill>
      <Phone w={PHONE.w} h={PHONE.h} screen={C.surface} style={{left: PHONE.left, top: PHONE.top, borderRadius: 96, ...fadeUp(phoneIn, 90)}}>
        <div style={{position: 'absolute', left: 0, top: 0, width: APP_W, transformOrigin: 'top left', transform: `scale(${ZOOM}) translateY(${-scroll}px)`}}>
          <Dashboard f={f} />
        </div>
      </Phone>
    </AbsoluteFill>
  );
};
