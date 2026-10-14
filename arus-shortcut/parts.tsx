// Video 3's pieces, drawn at app px (394 wide) unless noted: a neutral bank receipt (no bank's name or logo),
// the iOS-style notification, the Shortcut's list sheet, the step chip (scene px).
// No Apple marks or real app icons anywhere.
import type {ReactNode} from 'react';
import {prog} from '../lib/core';
import {Logo} from '../lib/Logo';
import {Lucide} from '../lib/lucide';
import {E, hitPulse} from '../lib/motion';
import {C, body, display} from '../lib/palette';

// --- The bank receipt -------------------------------------------------------------------------------------
export const Receipt = ({amount, payee, time, refNo}: {amount: string; payee: string; time: string; refNo: string}) => (
  <div style={{position: 'absolute', inset: 0, background: 'oklch(0.97 0.004 250)', fontFamily: body, color: 'oklch(0.25 0.02 255)'}}>
    <div style={{height: 104, background: 'oklch(0.45 0.08 255)', color: '#fff', display: 'flex', alignItems: 'flex-end', padding: '0 20px 16px', fontSize: 17, fontWeight: 700}}>Detail Transaksi</div>
    <div style={{display: 'grid', justifyItems: 'center', gap: 6, padding: '28px 20px 22px'}}>
      <span style={{display: 'grid', placeItems: 'center', width: 64, height: 64, borderRadius: '50%', background: 'oklch(0.62 0.15 150)'}}>
        <Lucide name="check" size={34} color="#fff" strokeWidth={3} />
      </span>
      <div style={{marginTop: 8, fontSize: 20, fontWeight: 800}}>Transfer Berhasil</div>
      <div style={{fontSize: 32, fontWeight: 800, letterSpacing: -0.5}}>{amount}</div>
    </div>
    <div style={{margin: '0 16px', borderRadius: 16, background: '#fff', padding: '6px 16px', fontSize: 14}}>
      {[
        ['Ke', payee],
        ['Tanggal', time],
        ['No. Referensi', refNo],
        ['Biaya Admin', 'Rp 0'],
        ['Total', amount],
      ].map(([k, v], i) => (
        <div key={k} style={{display: 'flex', justifyContent: 'space-between', gap: 12, padding: '12px 0', borderTop: i ? '1px solid oklch(0.92 0.005 250)' : undefined}}>
          <span style={{color: 'oklch(0.5 0.02 255)'}}>{k}</span>
          <span style={{fontWeight: 700, textAlign: 'right'}}>{v}</span>
        </div>
      ))}
    </div>
  </div>
);
/** Where the receipt's text sits (app px), for the scan beam. */
export const RECEIPT_TEXT = {top: 120, height: 420};

// --- The notification -------------------------------------------------------------------------------------
/** An iOS-style banner from Arus, dropping in from the top of the screen at `at`. */
export const Notification = ({f, at, children, top = 52, check = 0}: {f: number; at: number; children: ReactNode; top?: number; check?: number}) => {
  if (f < at) return null;
  const p = prog(f, at, 24, E.out);
  return (
    <div style={{position: 'absolute', left: 10, right: 10, top, display: 'flex', gap: 10, padding: '12px 14px', borderRadius: 22, background: 'oklch(0.97 0.004 250 / 0.94)', boxShadow: '0 14px 30px -12px oklch(0 0 0 / 0.35)', fontFamily: body, opacity: prog(f, at, 10, E.smooth), transform: `translateY(${(1 - p) * -90}px)`}}>
      <span style={{flex: 'none'}}>
        <Logo size={38} />
      </span>
      <div style={{minWidth: 0, flex: 1}}>
        <div style={{display: 'flex', justifyContent: 'space-between', fontSize: 14}}>
          <span style={{fontWeight: 700, color: C.ink}}>Arus</span>
          <span style={{color: C.inkFaint}}>sekarang</span>
        </div>
        <div style={{marginTop: 2, fontSize: 14, lineHeight: 1.35, color: C.ink}}>{children}</div>
      </div>
      {check > 0.01 && (
        <span style={{position: 'absolute', right: -8, bottom: -10, display: 'grid', placeItems: 'center', width: 34, height: 34, borderRadius: '50%', background: C.accentStrong, boxShadow: '0 6px 14px -4px oklch(0.5 0.125 162 / 0.6)', opacity: check, transform: `scale(${(0.6 + 0.4 * check) * (1 + 0.15 * hitPulse(f, at))})`}}>
          <Lucide name="check" size={18} color="#fff" strokeWidth={3} />
        </span>
      )}
    </div>
  );
};

// --- The Shortcut's list (Choose from List) ---------------------------------------------------------------
export const ListSheet = ({up, title, items, lit = {}, picked}: {up: number; title: string; items: string[]; lit?: Record<string, number>; picked?: string}) => (
  <div style={{position: 'absolute', left: 8, right: 8, bottom: 8, borderRadius: 26, background: 'oklch(0.97 0.004 250)', boxShadow: '0 -10px 40px -10px oklch(0 0 0 / 0.4)', padding: '16px 0 10px', fontFamily: body, transform: `translateY(${(1 - up) * 110}%)`}}>
    <div style={{padding: '0 18px 12px', fontSize: 14, fontWeight: 600, lineHeight: 1.35, color: C.inkSoft, textAlign: 'center'}}>{title}</div>
    <div style={{margin: '0 12px', borderRadius: 14, background: '#fff', overflow: 'hidden'}}>
      {items.map((it, i) => (
        <div key={it} style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 46, padding: '0 16px', borderTop: i ? '1px solid oklch(0.92 0.005 250)' : undefined, fontSize: 16, color: C.ink, background: `oklch(0.67 0.165 160 / ${(0.2 * Math.max(lit[it] ?? 0, it === picked ? 1 : 0)).toFixed(3)})`}}>
          {it}
          {it === picked && <Lucide name="check" size={18} color={C.accentStrong} strokeWidth={2.8} />}
        </div>
      ))}
    </div>
    <div style={{margin: '10px 12px 0', height: 46, borderRadius: 14, background: '#fff', display: 'grid', placeItems: 'center', fontSize: 16, fontWeight: 700, color: 'oklch(0.55 0.15 255)'}}>Batal</div>
  </div>
);
export const LIST_ROW = 46;

// --- The back tap -----------------------------------------------------------------------------------------
/** The phone's jolt on each knock: a few px, decaying (apply as translateX to the phone). */
export const knock = (f: number, ats: number[]) => ats.reduce((s, at) => s + (f >= at ? 7 * Math.exp(-(f - at) / 4) * Math.cos((f - at) * 1.7) : 0), 0);
/** Scene px: the "ketuk 2×" tag beside the phone, with a short arc per knock off its back edge. */
export const KnockTag = ({f, ats, x, y}: {f: number; ats: number[]; x: number; y: number}) => {
  if (f < ats[0]) return null;
  return (
    <div style={{position: 'absolute', left: x, top: y, fontFamily: body, opacity: 1 - prog(f, ats[ats.length - 1] + 60, 14, E.smooth)}}>
      {ats.map((at, i) => {
        const p = prog(f, at, 16, E.out);
        return f >= at && f < at + 20 ? <div key={i} style={{position: 'absolute', left: -60 + 26 * p, top: -50, width: 40, height: 100, borderRight: `5px solid ${C.highlight}`, borderRadius: '0 60px 60px 0', opacity: 1 - (f - at) / 20}} /> : null;
      })}
      <div style={{padding: '12px 24px', borderRadius: 999, background: C.raised, color: C.ink, fontSize: 38, fontWeight: 800, whiteSpace: 'nowrap', boxShadow: '0 14px 30px -16px oklch(0.2 0.06 168 / 0.6)', opacity: prog(f, ats[0], 10, E.smooth), transform: `translateX(${(1 - prog(f, ats[0], 22, E.out)) * -30}px) scale(${1 + 0.08 * hitPulse(f, ats[ats.length - 1])})`}}>
        ketuk {Math.min(ats.length, ats.filter((a) => f >= a).length)}×
      </div>
    </div>
  );
};

// --- The step chip (scene px) -----------------------------------------------------------------------------
export const StepChip = ({f, at, n, label}: {f: number; at: number; n: number; label: string}) => (
  <div style={{position: 'absolute', left: 0, right: 0, top: 206, display: 'flex', justifyContent: 'center', opacity: prog(f, at, 10, E.smooth), transform: `translateY(${(1 - prog(f, at, 24, E.out)) * 20}px)`}}>
    <div style={{display: 'flex', alignItems: 'center', gap: 14, padding: '10px 26px 10px 10px', borderRadius: 999, background: C.raised, fontFamily: display, fontSize: 40, fontWeight: 800, color: C.ink}}>
      <span style={{display: 'grid', placeItems: 'center', width: 54, height: 54, borderRadius: '50%', background: C.accentStrong, color: '#fff'}}>{n}</span>
      {label}
    </div>
  </div>
);

// --- iOS surfaces -----------------------------------------------------------------------------------------
export const OS_BG = 'oklch(0.95 0.004 250)';
export const BLUE = 'oklch(0.55 0.17 255)';
