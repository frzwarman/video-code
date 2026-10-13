// The Arus Home after the revamp (DashboardPage.tsx + HomeSections.tsx), phone layout, October figures.
// Drawn in app pixels (394 wide); callers scale it into their phone. Every section has a fixed top, so the
// camera can aim at a tile. Nothing here animates on its own: everything is a function of the frame.
import type {CSSProperties, ReactNode} from 'react';
import {Easing, interpolate} from 'remotion';
import {prog, roundK, rupiah} from './core';
import {CATEGORY, Lucide, Tile, type IconName} from './lucide';
import {C, body, pop, type Tone} from './palette';

export const APP_W = 394;
export const HOME = {
  band: {top: 0, h: 206},
  wallet: {top: 110, h: 290},
  services: {top: 424, h: 84},
  insights: {top: 532, h: 120},
  recent: {top: 676, h: 288},
  spend: {top: 988, h: 244},
  budgets: {top: 1256, h: 224},
  h: 1580,
  // Camera anchors (app px): the In / Out tiles on the wallet card, the first activity row (a transfer).
  inTile: {x: 112, y: 234},
  outTile: {x: 274, y: 234},
  transferRow: {x: 197, y: 750},
};

const T = {xs: 12, sm: 14, title: 15, h1: 28, balance: 32};
const panelApp: CSSProperties = {background: C.raised, border: `1px solid ${C.line}`, borderRadius: 24, boxShadow: '0 1px 2px oklch(0.3 0.06 168 / 0.05), 0 10px 28px -16px oklch(0.3 0.06 168 / 0.22)'};

const RECENT: {type: 'transfer' | 'expense' | 'income'; payee: string; sub: string; amount: number; icon: IconName; tone: Tone}[] = [
  {type: 'transfer', payee: 'Transfer', sub: '7 Okt, BCA to E-wallet', amount: 150_000, icon: 'arrowLeftRight', tone: 'sky'},
  {type: 'expense', payee: 'KEDAI KOPI', sub: '7 Okt, Makan', amount: 152_500, ...CATEGORY.Makan},
  {type: 'expense', payee: 'Listrik', sub: '5 Okt, Tagihan', amount: 350_000, ...CATEGORY.Tagihan},
  {type: 'expense', payee: 'Bensin', sub: '4 Okt, Transport', amount: 100_000, ...CATEGORY.Transport},
  {type: 'income', payee: 'Gaji', sub: '1 Okt, Gaji', amount: 5_200_000, ...CATEGORY.Gaji},
];
const SPEND = [
  ['Makan', 1_420_000],
  ['Belanja', 1_088_000],
  ['Tagihan', 750_000],
  ['Transport', 680_000],
] as const;
const BUDGETS = [
  ['Makan', 1_420_000, 2_000_000],
  ['Transport', 680_000, 800_000],
  ['Hiburan', 392_000, 400_000],
] as const;
const TONE = {income: C.income, expense: C.expense, transfer: C.transfer};
const SIGN = {income: '+', expense: '−', transfer: ''};

/** The Arus mark as moving water: three currents drifting across, faded at the edges (wave-mark.tsx). */
const WAVE_LEN = 32;
const waveD = (y: number, amp: number) => {
  let d = `M${-WAVE_LEN} ${y} Q${-WAVE_LEN + WAVE_LEN / 4} ${y - amp} ${-WAVE_LEN / 2} ${y}`;
  for (let x = 0; x <= 64 + WAVE_LEN; x += WAVE_LEN / 2) d += ` T${x} ${y}`;
  return d;
};
const WAVE_LINES = [
  {d: waveD(11, 2.6), width: 2, opacity: 0.35, pace: 2},
  {d: waveD(20, 3.4), width: 2.5, opacity: 0.6, pace: 1.5},
  {d: waveD(29, 4), width: 3, opacity: 1, pace: 1},
];
export const WaveMark = ({f, width, period = 3, color = '#fff'}: {f: number; width: number; period?: number; color?: string}) => (
  <svg width={width} height={(width * 40) / 64} viewBox="0 0 64 40" style={{display: 'block', overflow: 'visible'}}>
    <defs>
      <linearGradient id="wm-fade" x1="0" x2="1">
        <stop offset="0" stopColor="white" stopOpacity="0" />
        <stop offset="0.22" stopColor="white" />
        <stop offset="0.78" stopColor="white" />
        <stop offset="1" stopColor="white" stopOpacity="0" />
      </linearGradient>
      <mask id="wm-mask">
        <rect width="64" height="40" fill="url(#wm-fade)" />
      </mask>
    </defs>
    <g mask="url(#wm-mask)" fill="none" stroke={color} strokeLinecap="round">
      {WAVE_LINES.map((l) => (
        <path key={l.d} d={l.d} strokeWidth={l.width} strokeOpacity={l.opacity} transform={`translate(${-((f / 60 / (period * l.pace)) % 1) * WAVE_LEN} 0)`} />
      ))}
    </g>
  </svg>
);

const Section = ({top, h, children, style}: {top: number; h: number; children: ReactNode; style?: CSSProperties}) => (
  <div style={{position: 'absolute', left: 16, right: 16, top, height: h, ...style}}>{children}</div>
);

const Header = ({title, right}: {title: string; right?: ReactNode}) => (
  <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 16px 10px'}}>
    <span style={{fontSize: T.title, fontWeight: 700, color: C.ink}}>{title}</span>
    {right}
  </div>
);
const SeeAll = ({label = 'See all'}: {label?: string}) => (
  <span style={{display: 'flex', alignItems: 'center', gap: 3, fontSize: T.xs, fontWeight: 700, color: C.accentInk}}>
    {label}
    <Lucide name="arrowUpRight" size={12} color={C.accentInk} />
  </span>
);

const Flow = ({label, value, type, lit = 0}: {label: string; value: number; type: 'income' | 'expense'; lit?: number}) => (
  <div style={{position: 'relative', flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px 8px 8px', borderRadius: 16, background: C.sunken}}>
    <span style={{display: 'grid', placeItems: 'center', width: 28, height: 28, borderRadius: 8, background: type === 'income' ? C.incomeSoft : C.expenseSoft, flex: 'none'}}>
      <Lucide name={type === 'income' ? 'arrowDownLeft' : 'arrowUpRight'} size={16} color={TONE[type]} strokeWidth={2.6} />
    </span>
    <div style={{minWidth: 0}}>
      <div style={{fontSize: T.xs, fontWeight: 600, color: C.inkSoft, whiteSpace: 'nowrap'}}>{label}</div>
      <div style={{fontSize: 13, fontWeight: 800, color: C.ink, whiteSpace: 'nowrap', fontVariantNumeric: 'tabular-nums'}}>{SIGN[type]}{rupiah(value)}</div>
    </div>
    <div style={{position: 'absolute', inset: -2, borderRadius: 18, border: `2px solid ${C.accent}`, opacity: lit}} />
  </div>
);

const QuickAction = ({label, icon, tone}: {label: string; icon: IconName; tone: Tone}) => (
  <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6}}>
    <Tile icon={icon} tone={tone} size="md" />
    <span style={{fontSize: T.xs, fontWeight: 700, color: C.ink}}>{label}</span>
  </div>
);

const Insight = ({tone, title, text, icon, iconTone}: {tone: Tone; title: string; text: string; icon: IconName; iconTone: Tone}) => (
  <div style={{display: 'flex', alignItems: 'flex-start', gap: 12, width: 282, flex: 'none', padding: 16, borderRadius: 24, background: pop(tone).soft, boxSizing: 'border-box'}}>
    <div style={{flex: 1, minWidth: 0}}>
      <div style={{fontSize: T.title, fontWeight: 800, lineHeight: 1.3, color: C.ink}}>{title}</div>
      <div style={{fontSize: T.sm, color: C.inkSoft, marginTop: 4, lineHeight: 1.35}}>{text}</div>
    </div>
    <Tile icon={icon} tone={iconTone} size="md" />
  </div>
);

export const Home = ({f, lit = {}, countFrom = 0}: {f: number; lit?: {in?: number; out?: number; transfer?: number}; countFrom?: number}) => {
  // The app counts the balance up from 60% over 0.9 s the first time Home opens.
  const balance = roundK(interpolate(f, [countFrom, countFrom + 54], [947_000 * 0.6, 947_000], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.bezier(0.23, 1, 0.32, 1)}));
  const spendTotal = SPEND.reduce((a, s) => a + s[1], 0);
  return (
    <div style={{position: 'relative', width: APP_W, height: HOME.h, fontFamily: body, color: C.ink, background: C.surface}}>
      {/* The jade band: greeting, workspace, month; the wave mark flows across it. */}
      <div style={{position: 'absolute', left: 0, right: 0, top: 0, height: HOME.band.h, borderRadius: '0 0 32px 32px', overflow: 'hidden', background: `radial-gradient(24rem 14rem at 88% 0%, color-mix(in oklch, ${C.bandGlow} 45%, transparent), transparent 70%), linear-gradient(160deg, ${C.bandFrom}, ${C.bandTo})`}}>
        <svg viewBox="0 0 400 120" preserveAspectRatio="none" style={{position: 'absolute', left: 0, right: 0, bottom: 0, width: '100%', height: 112}}>
          <path d="M0 70c60-30 110 30 180 0s120-40 220 0v50H0Z" fill="white" opacity="0.07" />
          <path d="M0 92c70-24 130 22 200 0s130-28 200 0v28H0Z" fill="white" opacity="0.09" />
        </svg>
        <div style={{position: 'absolute', left: 20, top: 24, fontSize: T.sm, fontWeight: 600, color: C.onBandSoft}}>Hi, Jane</div>
        <div style={{position: 'absolute', left: 20, top: 44, display: 'flex', alignItems: 'center', gap: 4, fontSize: T.h1, fontWeight: 800, letterSpacing: -0.5, color: '#fff'}}>
          Keluarga
          <Lucide name="chevronDown" size={20} color="rgba(255,255,255,0.8)" strokeWidth={2.6} />
        </div>
        <div style={{position: 'absolute', left: 20, top: 86, display: 'flex', alignItems: 'center', gap: 4, padding: '5px 10px 5px 12px', borderRadius: 999, background: 'oklch(1 0 0 / 0.16)', fontSize: 13, fontWeight: 700, color: '#fff'}}>
          Oktober 2026
          <Lucide name="chevronDown" size={14} color="#fff" strokeWidth={2.6} />
        </div>
        <div style={{position: 'absolute', right: 16, top: 32}}>
          <WaveMark f={f} width={112} />
        </div>
      </div>

      {/* The wallet card rides up over the band. */}
      <Section top={HOME.wallet.top} h={HOME.wallet.h} style={{...panelApp, padding: 16, boxSizing: 'border-box'}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 6, fontSize: T.sm, fontWeight: 600, color: C.inkSoft}}>
          Total balance
          <Lucide name="eye" size={16} color={C.inkFaint} />
        </div>
        <div style={{marginTop: 4, fontSize: T.balance, fontWeight: 800, letterSpacing: -0.6, color: C.ink, fontVariantNumeric: 'tabular-nums', lineHeight: 1.2}}>{rupiah(balance)}</div>
        <div style={{display: 'flex', gap: 8, marginTop: 12}}>
          <Flow label="In this month" value={5_200_000} type="income" lit={lit.in} />
          <Flow label="Out this month" value={3_938_000} type="expense" lit={lit.out} />
        </div>
        <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginTop: 16, paddingTop: 16, borderTop: `1px solid ${C.line}`}}>
          <QuickAction label="Expense" icon="arrowUpRight" tone="coral" />
          <QuickAction label="Income" icon="arrowDownLeft" tone="mint" />
          <QuickAction label="Transfer" icon="arrowLeftRight" tone="sky" />
        </div>
      </Section>

      {/* The super-app row of shortcuts. */}
      <Section top={HOME.services.top} h={HOME.services.h} style={{display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8}}>
        {([
          ['Accounts', 'wallet', 'ocean'],
          ['Reports', 'chartPie', 'grape'],
          ['Categories', 'tags', 'bubblegum'],
          ['Workspaces', 'users', 'sky'],
        ] as const).map(([label, icon, tone]) => (
          <div key={label} style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6}}>
            <Tile icon={icon} tone={tone} size="lg" />
            <span style={{fontSize: T.xs, fontWeight: 700, color: C.ink}}>{label}</span>
          </div>
        ))}
      </Section>

      {/* Insights: a swipe rail; the second card peeks in from the right. */}
      <Section top={HOME.insights.top} h={HOME.insights.h} style={{left: 0, right: 0, overflow: 'hidden'}}>
        <div style={{position: 'absolute', left: 16, top: 0, display: 'flex', gap: 12}}>
          <Insight tone="tangerine" title="3-day streak" text="Logged today. See you tomorrow." icon="flame" iconTone="tangerine" />
          <Insight tone="tangerine" title="Makan is your top spend" text={`${Math.round((1_420_000 / spendTotal) * 100)}% of everything you spent this month.`} icon="utensils" iconTone="tangerine" />
          <Insight tone="sky" title="You're up Rp 1.262.000" text="More came in than went out this month." icon="trendingUp" iconTone="mint" />
        </div>
      </Section>

      <Section top={HOME.recent.top} h={HOME.recent.h} style={panelApp}>
        <Header title="Recent activity" right={<SeeAll />} />
        <div style={{padding: '0 16px'}}>
          {RECENT.map((tx, i) => (
            <div key={tx.payee} style={{position: 'relative', display: 'flex', alignItems: 'center', gap: 12, height: 44, borderRadius: 12}}>
              {i === 0 && <div style={{position: 'absolute', inset: '0 -8px', borderRadius: 12, background: C.transferSoft, opacity: lit.transfer ?? 0}} />}
              {/* Positioned, so the highlight behind the row never paints over the tile. */}
              <span style={{position: 'relative', display: 'flex', flex: 'none'}}>
                <Tile icon={tx.icon} tone={tx.tone} size="md" />
              </span>
              <div style={{position: 'relative', flex: 1, minWidth: 0}}>
                <div style={{fontSize: T.sm, fontWeight: 700, color: C.ink, whiteSpace: 'nowrap'}}>{tx.payee}</div>
                <div style={{fontSize: T.xs, color: C.inkSoft, whiteSpace: 'nowrap'}}>{tx.sub}</div>
              </div>
              <span style={{position: 'relative', fontSize: T.sm, fontWeight: 800, color: TONE[tx.type], fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap'}}>
                {SIGN[tx.type]}{rupiah(tx.amount)}
              </span>
            </div>
          ))}
        </div>
      </Section>

      {/* Where it went: a ranked list with bars, not a pie. */}
      <Section top={HOME.spend.top} h={HOME.spend.h} style={panelApp}>
        <Header title="Where it went" right={<span style={{fontSize: T.sm, fontWeight: 700, color: C.inkSoft}}>{rupiah(spendTotal)}</span>} />
        <div style={{padding: '0 16px', display: 'grid', gap: 10}}>
          {SPEND.map(([name, total]) => {
            const share = Math.round((total / spendTotal) * 100);
            const look = CATEGORY[name];
            return (
              <div key={name} style={{display: 'flex', alignItems: 'center', gap: 12}}>
                <Tile icon={look.icon} tone={look.tone} size="sm" />
                <div style={{flex: 1, minWidth: 0}}>
                  <div style={{display: 'flex', justifyContent: 'space-between', fontSize: T.sm, fontWeight: 700, color: C.ink}}>
                    <span>{name}</span>
                    <span style={{fontVariantNumeric: 'tabular-nums'}}>{rupiah(total)}</span>
                  </div>
                  <div style={{display: 'flex', alignItems: 'center', gap: 8, marginTop: 5}}>
                    <div style={{flex: 1, height: 6, borderRadius: 3, background: C.sunken, overflow: 'hidden'}}>
                      <div style={{width: `${share * prog(f, 10, 40)}%`, height: '100%', borderRadius: 3, background: pop(look.tone).strong}} />
                    </div>
                    <span style={{width: 34, textAlign: 'right', fontSize: T.xs, fontWeight: 600, color: C.inkSoft, fontVariantNumeric: 'tabular-nums'}}>{share}%</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Section>

      <Section top={HOME.budgets.top} h={HOME.budgets.h} style={panelApp}>
        <Header title="Budgets" right={<SeeAll label="All" />} />
        <div style={{padding: '0 16px', display: 'grid', gap: 12}}>
          {BUDGETS.map(([name, spent, amount]) => {
            const pct = Math.round((spent / amount) * 100);
            const state = pct >= 90 ? 'end' : pct >= 50 ? 'mid' : 'ok';
            const look = CATEGORY[name];
            return (
              <div key={name} style={{display: 'flex', alignItems: 'center', gap: 12}}>
                <Tile icon={look.icon} tone={look.tone} size="sm" />
                <div style={{flex: 1, minWidth: 0}}>
                  <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'baseline'}}>
                    <span style={{fontSize: T.sm, fontWeight: 700, color: C.ink}}>{name}</span>
                    <span style={{fontSize: T.xs, fontWeight: 700, color: state === 'end' ? C.expense : state === 'mid' ? C.warn : C.inkSoft, fontVariantNumeric: 'tabular-nums'}}>{rupiah(amount - spent)} left</span>
                  </div>
                  <div style={{height: 10, borderRadius: 5, background: C.sunken, marginTop: 6, overflow: 'hidden'}}>
                    <div style={{width: `${pct * prog(f, 10, 40)}%`, height: '100%', borderRadius: 5, background: state === 'end' ? C.expense : state === 'mid' ? C.warnBar : C.accent}} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Section>
    </div>
  );
};

/** The phone's tab bar: four destinations around a raised Add button (AppShell.tsx). Fixed to the viewport. */
export const TabBar = ({active = 'Home'}: {active?: string}) => (
  <div style={{position: 'absolute', left: 0, right: 0, bottom: 0, height: 86, borderRadius: '28px 28px 0 0', background: C.raised, borderTop: `1px solid ${C.line}`, boxShadow: '0 -2px 6px oklch(0.3 0.06 168 / 0.08), 0 -28px 56px -24px oklch(0.3 0.06 168 / 0.38)', fontFamily: body}}>
    <div style={{display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', alignItems: 'end', padding: '4px 8px 0'}}>
      {([
        ['Home', 'house'],
        ['Transactions', 'receiptText'],
        null,
        ['Budgets', 'target'],
        ['Me', null],
      ] as const).map((tab, i) =>
        tab === null ? (
          <div key="add" style={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
            <div style={{marginTop: -24, width: 60, height: 60, borderRadius: '50%', background: C.accentStrong, display: 'grid', placeItems: 'center', boxShadow: `0 0 0 5px ${C.raised}, 0 10px 24px -8px oklch(0.5 0.125 162 / 0.55)`}}>
              <Lucide name="plus" size={28} color={C.onAccent} strokeWidth={2.6} />
            </div>
            <span style={{marginTop: 2, fontSize: 11, fontWeight: 700, color: C.inkSoft}}>Add</span>
          </div>
        ) : (
          <div key={tab[0]} style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, paddingTop: 4, fontSize: 11, fontWeight: 700, color: tab[0] === active ? C.accentInk : C.inkSoft}}>
            <span style={{position: 'relative', display: 'grid', placeItems: 'center', width: 56, height: 32, borderRadius: 999, background: tab[0] === active ? C.accentSoft : 'transparent'}}>
              {tab[1] ? (
                <Lucide name={tab[1]} size={22} color={tab[0] === active ? C.accentInk : C.inkSoft} />
              ) : (
                <span style={{width: 24, height: 24, borderRadius: '50%', background: pop('sun').soft, color: pop('sun').strong, display: 'grid', placeItems: 'center', fontSize: 9, fontWeight: 800}}>J</span>
              )}
            </span>
            {tab[0]}
          </div>
        ),
      )}
    </div>
  </div>
);
