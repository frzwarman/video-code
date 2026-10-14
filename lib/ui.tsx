// The app's UI, redrawn for page mock-ups at app pixels (394 wide): header, bottom sheet, fields, chips,
// colours, the icon picker, buttons, the Accounts card. Nothing animates on its own; callers pass progress values.
import type {CSSProperties, ReactNode} from 'react';
import {ICON_GROUPS} from './categoryIcons';
import {ACCOUNT, Lucide, Tile, type IconName} from './lucide';
import {C, body, pop} from './palette';

export const PANEL: CSSProperties = {background: C.raised, border: `1px solid ${C.line}`, borderRadius: 24, boxShadow: '0 1px 2px oklch(0.3 0.06 168 / 0.05), 0 10px 28px -16px oklch(0.3 0.06 168 / 0.22)'};

/** Text typed in over time: `cps` characters per second from frame `at`. */
export const typed = (text: string, f: number, at: number, cps = 14) => text.slice(0, Math.max(0, Math.min(text.length, Math.floor(((f - at) * cps) / 60))));
/** A caret that blinks on the half second. */
export const caretOn = (f: number) => Math.floor(f / 30) % 2 === 0;

export const PageHeader = ({title, subtitle, action}: {title: string; subtitle?: string; action?: ReactNode}) => (
  <div style={{display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 12}}>
    <div style={{minWidth: 0}}>
      <div style={{fontSize: 28, fontWeight: 800, letterSpacing: -0.5, lineHeight: 1.15, color: C.ink}}>{title}</div>
      {subtitle && <div style={{marginTop: 4, fontSize: 14, color: C.inkSoft, lineHeight: 1.35}}>{subtitle}</div>}
    </div>
    {action && <div style={{flex: 'none'}}>{action}</div>}
  </div>
);

export const Button = ({children, variant = 'secondary', size = 'md', icon, style}: {children: ReactNode; variant?: 'primary' | 'secondary' | 'soft' | 'ghost'; size?: 'sm' | 'md' | 'lg'; icon?: IconName; style?: CSSProperties}) => {
  const h = size === 'sm' ? 36 : size === 'lg' ? 48 : 44;
  const px = size === 'sm' ? 16 : size === 'lg' ? 24 : 20;
  const look: CSSProperties =
    variant === 'primary'
      ? {background: C.accentStrong, color: C.onAccent, boxShadow: '0 10px 24px -8px oklch(0.5 0.125 162 / 0.55)'}
      : variant === 'soft'
        ? {background: C.accentSoft, color: C.accentInk}
        : variant === 'ghost'
          ? {color: C.inkSoft}
          : {background: C.raised, color: C.ink, border: `1px solid ${C.lineStrong}`};
  return (
    <div style={{display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8, height: h, padding: `0 ${px}px`, borderRadius: 999, fontSize: size === 'lg' ? 16 : 14, fontWeight: 700, whiteSpace: 'nowrap', boxSizing: 'border-box', ...look, ...style}}>
      {icon && <Lucide name={icon} size={16} color="currentColor" strokeWidth={2.4} />}
      {children}
    </div>
  );
};

/** The phone's bottom sheet (dialog.tsx): `up` 0 → 1 raises it. */
export const Sheet = ({up, title, description, children}: {up: number; title: string; description?: string; children: ReactNode}) => (
  <div style={{position: 'absolute', left: 0, right: 0, bottom: 0, borderRadius: '24px 24px 0 0', background: C.raised, borderTop: `1px solid ${C.line}`, boxShadow: '0 -2px 6px oklch(0.3 0.06 168 / 0.08), 0 -28px 56px -24px oklch(0.3 0.06 168 / 0.38)', transform: `translateY(${(1 - up) * 100}%)`, fontFamily: body}}>
    <div style={{width: 40, height: 6, borderRadius: 3, background: C.lineStrong, margin: '10px auto 0'}} />
    <div style={{padding: '12px 16px 8px'}}>
      <div style={{fontSize: 18, fontWeight: 800, letterSpacing: -0.3, color: C.ink}}>{title}</div>
      {description && <div style={{marginTop: 2, fontSize: 14, color: C.inkSoft}}>{description}</div>}
    </div>
    {/* minmax(0, 1fr): a nowrap child (a long link) must clip, not widen the sheet past the phone. */}
    <div style={{padding: '8px 16px 28px', display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: 16}}>{children}</div>
  </div>
);

export const Field = ({label, required, children}: {label: string; required?: boolean; children: ReactNode}) => (
  <div style={{display: 'grid', gap: 6}}>
    <div style={{fontSize: 14, fontWeight: 600, color: C.ink}}>
      {label}
      {required && <span style={{color: C.expense, marginLeft: 2}}>*</span>}
    </div>
    {children}
  </div>
);

export const Input = ({value, placeholder, focus = 0, caret = false, icon, prefix}: {value: string; placeholder?: string; focus?: number; caret?: boolean; icon?: IconName; prefix?: string}) => (
  <div style={{position: 'relative', display: 'flex', alignItems: 'center', gap: 6, height: 44, padding: '0 12px', borderRadius: 14, background: C.raised, border: `1px solid ${C.lineStrong}`, fontSize: 16, color: value ? C.ink : C.inkFaint, boxSizing: 'border-box', fontVariantNumeric: 'tabular-nums'}}>
    {prefix && <span style={{color: C.inkSoft}}>{prefix}</span>}
    {value || placeholder}
    {caret && <span style={{width: 2, height: 20, background: C.accentStrong}} />}
    {icon && (
      <span style={{marginLeft: 'auto'}}>
        <Lucide name={icon} size={16} color={C.inkFaint} />
      </span>
    )}
    <div style={{position: 'absolute', inset: -3, borderRadius: 17, border: `2px solid ${C.accent}`, opacity: focus}} />
  </div>
);

/** A chip group: `value` is selected; `lit` is a 0–1 glow per label while the voice names it. */
export const Chips = ({options, value, lit}: {options: {label: string; icon?: IconName}[]; value?: string; lit?: Record<string, number>}) => (
  <div style={{display: 'flex', flexWrap: 'wrap', gap: 8}}>
    {options.map((o) => {
      const sel = o.label === value;
      const hot = lit?.[o.label] ?? 0;
      return (
        <div key={o.label} style={{display: 'inline-flex', alignItems: 'center', gap: 6, height: 36, padding: '0 14px', borderRadius: 999, fontSize: 14, fontWeight: 700, boxSizing: 'border-box', background: sel ? C.accentSoft : C.raised, color: sel ? C.accentInk : C.ink, border: `1px solid ${sel ? C.accent : C.lineStrong}`, transform: `scale(${1 + 0.06 * hot})`, boxShadow: hot > 0 ? `0 0 0 ${3 * hot}px oklch(0.67 0.165 160 / 0.35)` : undefined}}>
          {o.icon && <Lucide name={o.icon} size={16} color="currentColor" strokeWidth={2.4} />}
          {o.label}
        </div>
      );
    })}
  </div>
);

/** The category form's colours (CategoriesPage.tsx): stored as hex, the first nine are the old palette. */
export const COLOURS = ['#ef4444', '#f97316', '#f59e0b', '#22c55e', '#0d9488', '#0ea5e9', '#3b82f6', '#6366f1', '#8b5cf6', '#ec4899', '#a16207', '#64748b'];
const glowRing = (hot: number) => (hot > 0 ? `, 0 0 0 ${2 + 4 * hot}px oklch(0.67 0.165 160 / ${(0.35 * hot).toFixed(3)})` : '');
/** The colour row: "Automatic" (a sparkle), then plain dots; the pick is ringed and ticked. */
export const Colours = ({value, lit}: {value: string | null; lit?: Record<string, number>}) => (
  <div style={{display: 'flex', flexWrap: 'wrap', gap: 10}}>
    {[null, ...COLOURS].map((hex) => {
      const hot = lit?.[hex ?? 'auto'] ?? 0;
      const ring = value === hex ? `0 0 0 2px ${C.raised}, 0 0 0 4px ${C.ink}` : '0 0 0 0 transparent';
      return (
        <span key={hex ?? 'auto'} style={{display: 'grid', placeItems: 'center', width: 36, height: 36, borderRadius: '50%', background: hex ?? C.sunken, boxShadow: ring + glowRing(hot), transform: `scale(${1 + 0.1 * hot})`}}>
          {hex === null ? <Lucide name="sparkles" size={16} color={C.inkSoft} /> : value === hex && <Lucide name="check" size={16} color="#fff" strokeWidth={3} />}
        </span>
      );
    })}
  </div>
);

/** The icon picker: a bordered, scrolling box of grouped icons, 7 to a row; the pick is inverted. */
export const ICON_BOX = {h: 224, pad: 6, label: 28, gap: 4, cols: 7, cell: (362 - 2 - 12 - 6 * 4) / 7};
const rows = (n: number) => Math.ceil(n / ICON_BOX.cols);
const groupH = (n: number) => ICON_BOX.label + rows(n) * ICON_BOX.cell + (rows(n) - 1) * ICON_BOX.gap;
/** How far the box scrolls to centre `key`. */
export const iconScroll = (key: string) => {
  let y = ICON_BOX.pad;
  for (const g of ICON_GROUPS) {
    const i = g.icons.findIndex(([k]) => k === key);
    if (i >= 0) return y + ICON_BOX.label + Math.floor(i / ICON_BOX.cols) * (ICON_BOX.cell + ICON_BOX.gap) + ICON_BOX.cell / 2 - ICON_BOX.h / 2;
    y += groupH(g.icons.length);
  }
  return 0;
};
export const IconGrid = ({value, scroll = 0, lit = 0}: {value: string | null; scroll?: number; lit?: number}) => (
  <div style={{position: 'relative', height: ICON_BOX.h, borderRadius: 16, border: `1px solid ${C.line}`, overflow: 'hidden'}}>
    <div style={{padding: ICON_BOX.pad, transform: `translateY(${-scroll}px)`}}>
      {ICON_GROUPS.map((g) => (
        <div key={g.label}>
          <div style={{height: ICON_BOX.label, boxSizing: 'border-box', padding: '8px 6px 4px', fontSize: 12, lineHeight: '16px', fontWeight: 600, color: C.inkFaint}}>{g.label}</div>
          <div style={{display: 'grid', gridTemplateColumns: `repeat(${ICON_BOX.cols}, 1fr)`, gap: ICON_BOX.gap}}>
            {g.icons.map(([key, Icon]) => {
              const sel = key === value;
              return (
                <span key={key} style={{display: 'grid', placeItems: 'center', height: ICON_BOX.cell, borderRadius: 16, background: sel ? C.ink : 'transparent', boxShadow: sel && lit > 0 ? `0 0 0 ${2 + 4 * lit}px oklch(0.67 0.165 160 / ${(0.35 * lit).toFixed(3)})` : undefined, transform: `scale(${sel ? 1 + 0.12 * lit : 1})`}}>
                  <Icon size={20} color={sel ? C.raised : C.inkSoft} />
                </span>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  </div>
);

/** The Accounts page card: soft tone, two blobs, a tile, the name, the kind and opening date, the balance. */
export const AccountCard = ({name, kind, balance, opened, lit = 0}: {name: string; kind: keyof typeof ACCOUNT; balance: string; opened: string; lit?: number}) => {
  const look = ACCOUNT[kind];
  const tone = pop(look.tone);
  return (
    <div style={{position: 'relative', overflow: 'hidden', borderRadius: 24, padding: 16, background: tone.soft, fontFamily: body}}>
      <div style={{position: 'absolute', top: -64, right: -48, width: 160, height: 160, borderRadius: '50%', background: tone.strong, opacity: 0.15}} />
      <div style={{position: 'absolute', top: -8, right: -96, width: 160, height: 160, borderRadius: '50%', background: tone.strong, opacity: 0.1}} />
      <div style={{position: 'relative', display: 'flex', alignItems: 'flex-start', gap: 12}}>
        <span style={{display: 'grid', placeItems: 'center', width: 44, height: 44, borderRadius: 16, background: C.raised, flex: 'none'}}>
          <Lucide name={look.icon} size={20} color={tone.strong} />
        </span>
        <div style={{minWidth: 0, flex: 1}}>
          <div style={{fontSize: 16, fontWeight: 700, color: C.ink}}>{name}</div>
          <div style={{marginTop: 2, fontSize: 12, fontWeight: 600, color: C.inkSoft}}>{look.label} · Opened {opened}</div>
        </div>
      </div>
      <div style={{position: 'relative', marginTop: 14, fontSize: 24, fontWeight: 800, letterSpacing: -0.5, color: C.ink, fontVariantNumeric: 'tabular-nums', display: 'inline-block'}}>
        {balance}
        <span style={{position: 'absolute', inset: '-4px -8px', borderRadius: 10, border: `2px solid ${C.accent}`, background: 'oklch(0.67 0.165 160 / 0.12)', opacity: lit}} />
      </div>
    </div>
  );
};
