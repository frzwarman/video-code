// S3 — Hook C: transfer receipt, double-tap the back, pick the category from the list the Shortcut shows,
// notification, logged. (Known payees skip the list: Arus files them itself.)
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {type CameraKey, type Cue, back, cue, kick, prog, spin} from '../core';
import {Marker, Ring, ScanBeam, YELLOW_MARK} from '../Fx';
import {Coffee} from '../icons';
import {Phone, bezel} from '../Phone';
import {C, OS, body, display} from '../palette';
import {Sticker} from '../Sticker';

// VO: "Habis transfer? Ketuk DUA kali bagian belakang iPhone-mu." | "Pilih kategorinya," | "dan LANGSUNG tercatat."
const END1 = cue('S3', 0, 1);
const TAPS = [END1 + 6, END1 + 22];
const SCAN_AT = TAPS[1] + 4; // the Shortcut reads the screen on the phone
const LIST_AT = SCAN_AT + 22; // a new payee: Arus asks which category
const PICK_AT = cue('S3', 1, 0.85);
const LIST_DOWN = PICK_AT + 10;
const NOTIFY_AT = cue('S3', 2) - 8;
const LOGGED_AT = cue('S3', 2) + 12;

export const camera: CameraKey[] = [
  {at: 0, zoom: 1.25, x: 540, y: 700, dur: 1},
  {at: TAPS[0] - 16, zoom: 1, dur: 24},
  {at: LIST_AT, zoom: 1.5, x: 540, y: 1040, dur: 20},
  {at: NOTIFY_AT, zoom: 1.6, x: 540, y: 500, dur: 18},
  {at: LOGGED_AT, zoom: 1, dur: 30},
];

export const sfx: Cue[] = [
  ...TAPS.map((at) => ({at, sound: 'tap', volume: 0.9})),
  {at: SCAN_AT, sound: 'whoosh', volume: 0.35},
  {at: LIST_AT, sound: 'whoosh', volume: 0.3},
  {at: PICK_AT, sound: 'tap', volume: 0.8},
  {at: NOTIFY_AT, sound: 'ding', volume: 0.7},
  {at: LOGGED_AT, sound: 'snap', volume: 0.6},
];

const PHONE = {left: 280, top: 280, w: 520, h: 1120};
const BZ = bezel(PHONE.w, PHONE.h);
const SCREEN_H = BZ.screenH;
const CATEGORIES = ['Makan', 'Transport', 'Belanja', 'Tagihan', 'Hiburan', 'Lainnya'];
const PICK = 0;
const SHEET_H = 560;
const ROW_Y = (i: number) => SCREEN_H - SHEET_H + 118 + i * 64 + 32; // centre of row i, screen coords

// A generic transfer receipt: no bank name or logo.
const INK = 'oklch(0.27 0.02 180)';
const SOFT = 'oklch(0.52 0.02 180)';
const ROWS = [
  ['Ke', 'KEDAI KOPI'],
  ['Tanggal', '07 Okt 2026'],
  ['No. Ref', '2610 0714 5521'],
];

const Receipt = () => (
  <div style={{position: 'absolute', inset: 0, padding: '230px 40px 0', fontFamily: body, color: INK, textAlign: 'center'}}>
    <svg width={150} height={150} viewBox="0 0 24 24" style={{display: 'block', margin: '0 auto'}}>
      <circle cx={12} cy={12} r={12} fill="oklch(0.62 0.15 150)" />
      <path d="M6.5 12.5l3.5 3.5 7.5-8" stroke="#fff" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
    <div style={{fontWeight: 800, fontSize: 44, marginTop: 36}}>Transfer Berhasil</div>
    <div style={{fontWeight: 800, fontSize: 76, marginTop: 14, whiteSpace: 'nowrap'}}>Rp 152.500</div>
    <div style={{height: 2, background: 'oklch(0.88 0.01 180)', margin: '64px 0 28px'}} />
    {ROWS.map(([k, v]) => (
      <div key={k} style={{display: 'flex', justifyContent: 'space-between', fontSize: 33, padding: '22px 0'}}>
        <span style={{color: SOFT, fontWeight: 600}}>{k}</span>
        <span style={{fontWeight: 800}}>{v}</span>
      </div>
    ))}
  </div>
);

// The Shortcut's "Choose from List": your categories, because KEDAI KOPI is new.
const Picker = ({f}: {f: number}) => {
  const up = prog(f, LIST_AT, 16);
  const down = prog(f, LIST_DOWN, 12);
  if (f < LIST_AT) return null;
  return (
    <div style={{position: 'absolute', left: 0, right: 0, top: SCREEN_H - SHEET_H * up + SHEET_H * down, height: SHEET_H + 40, borderRadius: '36px 36px 0 0', background: 'oklch(0.99 0.003 175)', boxShadow: '0 -20px 60px oklch(0 0 0 / 0.25)', fontFamily: body}}>
      <div style={{padding: '26px 30px 4px', fontSize: 27, fontWeight: 800, color: INK}}>Pilih kategori</div>
      <div style={{padding: '0 30px 12px', fontSize: 20, fontWeight: 600, color: SOFT}}>KEDAI KOPI · Rp 152.500</div>
      {CATEGORIES.map((c, i) => {
        const picked = i === PICK;
        const lit = picked ? prog(f, PICK_AT - 4, 8) : 0;
        return (
          <div key={c} style={{margin: '0 16px', height: 64, borderRadius: 16, display: 'flex', alignItems: 'center', padding: '0 18px', boxSizing: 'border-box', borderTop: i ? '1px solid oklch(0.9 0.01 180)' : undefined, background: `oklch(0.76 0.13 170 / ${(0.35 * lit).toFixed(3)})`, fontSize: 28, fontWeight: picked ? 800 : 600, color: INK, transform: `translateX(${picked ? kick(f, PICK_AT, 4, 5) : 0}px)`}}>
            {c}
          </div>
        );
      })}
    </div>
  );
};

// What the iPhone Shortcut shows: the app's real quick-add message format.
const Notification = ({p}: {p: number}) => (
  <div
    style={{
      position: 'absolute',
      top: 76,
      left: 14,
      right: 14,
      padding: '24px 26px',
      borderRadius: 40,
      background: OS.bg,
      border: `2px solid ${OS.line}`,
      fontFamily: body,
      transform: `translateY(${(1 - p) * -260}px)`,
      boxShadow: '0 24px 48px -20px oklch(0 0 0 / 0.6)',
    }}
  >
    <div style={{display: 'flex', alignItems: 'center', gap: 14, fontSize: 25, fontWeight: 600, color: OS.soft, letterSpacing: 1}}>
      <div style={{width: 40, height: 40, borderRadius: 11, background: `linear-gradient(135deg, ${C.logoA}, ${C.logoB})`}} />
      <span style={{flex: 1}}>SHORTCUTS</span>
      <span style={{letterSpacing: 0}}>sekarang</span>
    </div>
    <div style={{fontSize: 35, fontWeight: 700, color: OS.ink, marginTop: 14, lineHeight: 1.3}}>
      Spent Rp 152.500 · KEDAI KOPI · Makan · BCA
    </div>
  </div>
);

export const Scene = () => {
  const f = useCurrentFrame();
  const phoneIn = prog(f, 0, 30);
  // Each tap nudges the phone; it settles back within ~12 frames.
  const nudge = TAPS.reduce((s, at) => s + (f >= at ? Math.exp(-(f - at) / 5) : 0), 0);
  const notify = prog(f, NOTIFY_AT, 26, back);
  const logged = prog(f, LOGGED_AT, 20, back);
  const dim = 0.25 * prog(f, LIST_AT, 16) * (1 - prog(f, LIST_DOWN, 12));

  return (
    <AbsoluteFill>
      {TAPS.map((at) => {
        const p = prog(f, at, 40);
        if (p <= 0 || p >= 1) return null;
        return (
          <div
            key={at}
            style={{
              position: 'absolute',
              left: 540 - (300 + p * 360),
              top: 840 - (300 + p * 360),
              width: (300 + p * 360) * 2,
              height: (300 + p * 360) * 2,
              borderRadius: '50%',
              border: `6px solid ${C.highlight}`,
              opacity: 0.8 * (1 - p),
            }}
          />
        );
      })}
      <Phone
        screen="oklch(0.97 0.005 175)"
        style={{
          left: PHONE.left,
          top: PHONE.top,
          opacity: phoneIn,
          transform: `perspective(1600px) translateY(${(1 - phoneIn) * 120}px) rotateY(${nudge * -5}deg) scale(${1 - 0.015 * nudge})`,
        }}
      >
        <Receipt />
        <ScanBeam f={f} at={SCAN_AT} dur={18} top={60} height={820} />
        <div style={{position: 'absolute', inset: 0, background: `oklch(0 0 0 / ${dim.toFixed(3)})`}} />
        <Picker f={f} />
        {f >= NOTIFY_AT && <Notification p={notify} />}
      </Phone>
      <Ring f={f} at={PICK_AT} x={540} y={PHONE.top + BZ.inset + ROW_Y(PICK)} r0={16} r1={110} dur={22} color={C.accent} />
      {f >= TAPS[0] && (
        <div
          style={{
            position: 'absolute',
            left: 840,
            top: 700,
            fontFamily: display,
            fontWeight: 700,
            fontSize: 84,
            color: C.highlight,
            opacity: prog(f, TAPS[0], 10) * (1 - prog(f, LIST_AT + 6, 16)),
            transform: `scale(${0.6 + 0.4 * prog(f, TAPS[0], 16, back)}) rotate(${spin(f, TAPS[0], 18, -40)}deg)`,
          }}
        >
          2×
        </div>
      )}
      <Sticker Icon={Coffee} x={80} y={1000} at={NOTIFY_AT + 14} f={f} tilt={-7} />
      <div
        style={{
          position: 'absolute',
          top: 1440,
          width: '100%',
          display: 'flex',
          justifyContent: 'center',
          opacity: logged,
          transform: `translateY(${(1 - logged) * 30}px)`,
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 18,
            padding: '18px 40px',
            borderRadius: 999,
            background: C.accentSoft,
            fontFamily: body,
            fontWeight: 800,
            fontSize: 52,
            color: C.ink,
          }}
        >
          <svg width={48} height={48} viewBox="0 0 24 24">
            <path d="M5 12.5l4.5 4.5L19 7.5" stroke={C.income} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" fill="none" pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - prog(f, LOGGED_AT + 6, 12)} />
          </svg>
          <Marker at={LOGGED_AT + 12} f={f} color={YELLOW_MARK}>Langsung</Marker>&nbsp;tercatat.
        </div>
      </div>
    </AbsoluteFill>
  );
};
