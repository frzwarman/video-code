// S14 — Add to Home Screen. iPhone: Safari → Share → "Tambah ke Layar Utama" → the Arus icon lands on the
// home screen. Then Android: Chrome → ⋮ → "Tambahkan ke Layar utama" → same home screen.
import {AbsoluteFill, random, useCurrentFrame} from 'remotion';
import {type CameraKey, type Cue, back, fadeUp, kick, prog, spin} from '../../lib/core';
import {cue, voiceEnd} from '../voice';
import {Marker, Ring} from '../../lib/Fx';
import {Logo} from '../../lib/Logo';
import {Phone, bezel} from '../../lib/Phone';
import {APP_W, Home} from '../../lib/Home';
import {C, body, display} from '../../lib/palette';

// Voice segments: 0 "…tidak perlu diunduh dari App Store." · 1 "Buka Arus di Safari," · 2 "ketuk tombol Bagikan,"
// 3 "lalu pilih Tambah ke Layar Utama." · 4 "Sekarang Arus ada di layar utamamu, seperti aplikasi biasa."
// 5 "Di Android: ketuk menu Chrome, lalu pilih Tambahkan ke Layar utama."
const STORE_AT = cue('S14', 0, 0.78);
const URL_AT = cue('S14', 1, 0.3);
const TAP_SHARE = cue('S14', 2, 0.7);
const SHEET_UP = cue('S14', 2, 1);
const ROW_AT = cue('S14', 3, 0.45);
const TAP_ROW = cue('S14', 3, 0.95);
const SHEET_DOWN = TAP_ROW + 10;
const HOME_AT = cue('S14', 4);
const ICON_AT = cue('S14', 4, 0.3);
const CAPTION_AT = cue('S14', 4, 0.6);
const ANDROID_AT = cue('S14', 5);
const TAP_MENU = cue('S14', 5, 0.3);
const MENU_AT = TAP_MENU + 6;
const ROW2_AT = cue('S14', 5, 0.78);
const TAP_ROW2 = cue('S14', 5, 0.98);
const AGAIN_AT = voiceEnd('S14') + 6; // back to the home screen: same result


export const sfx: Cue[] = [
  {at: STORE_AT, sound: 'thud', volume: 0.5},
  {at: TAP_SHARE, sound: 'tap', volume: 0.8},
  {at: SHEET_UP, sound: 'whoosh', volume: 0.4},
  {at: TAP_ROW, sound: 'tap', volume: 0.8},
  {at: SHEET_DOWN, sound: 'whoosh', volume: 0.3},
  {at: ICON_AT, sound: 'snap', volume: 0.7},
  {at: TAP_MENU, sound: 'tap', volume: 0.8},
  {at: MENU_AT, sound: 'whoosh', volume: 0.3},
  {at: TAP_ROW2, sound: 'tap', volume: 0.8},
  {at: AGAIN_AT + 8, sound: 'snap', volume: 0.5},
];

const PHONE = {left: 310, top: 380, w: 460, h: 990};
const BZ = bezel(PHONE.w, PHONE.h);
const SCREEN = {w: BZ.screenW, h: BZ.screenH}; // inside the bezel
const SHEET_H = 520;
const SHARE_ICON = {x: 216, y: 914}; // screen coordinates
const ROWS = ['Salin', 'Tambah ke Daftar Bacaan', 'Tambah Penanda', 'Tambah ke Favorit', 'Tambah ke Layar Utama', 'Tandai'];
const PICK = 4;
const MENU = ['Tab baru', 'Riwayat', 'Unduhan', 'Tambahkan ke Layar utama', 'Setelan'];
const PICK2 = 3;
const MENU_W = 300;
const DOTS = {x: SCREEN.w - 30, y: 44};
const SLOT = {r: 1, c: 3}; // the empty home-screen slot Arus lands in
const toScene = (p: {x: number; y: number}) => ({x: PHONE.left + BZ.inset + p.x, y: PHONE.top + BZ.inset + p.y});
const SHARE = toScene(SHARE_ICON);
const ROW = toScene({x: SCREEN.w / 2, y: SCREEN.h - SHEET_H + 110 + PICK * 62 + 28});
const SLOT_XY = toScene({x: 24 + SLOT.c * 104 + 38, y: 90 + SLOT.r * 120 + 38});
const DOTS_XY = toScene(DOTS);
const ROW2 = toScene({x: SCREEN.w - 12 - MENU_W / 2, y: 70 + 14 + PICK2 * 54 + 27});
const tileColor = (i: number) => `oklch(${(0.5 + random(`tile-l-${i}`) * 0.18).toFixed(3)} 0.07 ${Math.floor(random(`tile-h-${i}`) * 360)})`;

const ICONS = [
  'M9 9h10v10H9zM5 15V5h10', // copy
  'M4 15a3 3 0 106 0 3 3 0 00-6 0zM14 15a3 3 0 106 0 3 3 0 00-6 0zM10 15h4M4 15l2-7M20 15l-2-7', // glasses
  'M5 4h11a3 3 0 013 3v13H8a3 3 0 01-3-3zM5 17h14', // book
  'M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z', // star
  'M4 6a2 2 0 012-2h12a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2zM12 8v8M8 12h8', // plus in a square
  'M4 20l4-1 10-10-3-3L5 16zM13 8l3 3', // pen
];
const MENU_ICONS = [
  'M4 6a2 2 0 012-2h12a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2zM12 9v6M9 12h6', // new tab
  'M12 7v5l3 2M4 12a8 8 0 108-8', // history
  'M12 4v11M7 10l5 5 5-5M5 20h14', // download
  'M4 6a2 2 0 012-2h12a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2zM12 8v8M8 12h8', // add to home
  'M12 8a4 4 0 100 8 4 4 0 000-8zM12 2v2M12 20v2M2 12h2M20 12h2', // settings
];

// The app, as a browser shows it: the real Home, scaled to the phone's screen.
const Dashboard = ({f, top}: {f: number; top: number}) => (
  <div style={{position: 'absolute', left: 0, top, width: APP_W, transformOrigin: 'top left', transform: `scale(${SCREEN.w / APP_W})`}}>
    <Home f={f} />
  </div>
);

// Safari: address pill and toolbar at the bottom.
const SafariView = ({f}: {f: number}) => {
  const glow = prog(f, URL_AT, 10) * (1 - prog(f, URL_AT + 50, 14));
  return (
    <div style={{position: 'absolute', inset: 0, background: C.surface, fontFamily: body}}>
      <Dashboard f={f} top={60} />
      <div style={{position: 'absolute', left: 0, right: 0, bottom: 0, height: 150, background: 'oklch(0.975 0.004 165 / 0.96)', borderTop: `1px solid ${C.line}`}}>
        <div style={{position: 'absolute', top: 16, left: 20, right: 20, height: 44, borderRadius: 14, background: C.sunken, display: 'grid', placeItems: 'center', fontSize: 17, fontWeight: 600, color: C.ink}}>
          arus-finance.farizz-a.workers.dev
        </div>
        <div style={{position: 'absolute', top: 13, left: 17, right: 17, height: 50, borderRadius: 17, border: `3px solid ${C.accent}`, opacity: glow}} />
        <svg width={SCREEN.w} height={60} viewBox={`0 0 ${SCREEN.w} 60`} style={{position: 'absolute', bottom: 18, left: 0}} fill="none" stroke={C.accentStrong} strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round">
          <path d="M46 18l-12 12 12 12" opacity={0.6} />
          <path d="M114 18l12 12-12 12" opacity={0.35} />
          <path d={`M${SHARE_ICON.x - 12} 24v19h24V24M${SHARE_ICON.x} 36V10M${SHARE_ICON.x - 7} 17l7-7 7 7`} />
          <path d="M300 18h24v24h-24zM312 18v24" opacity={0.6} />
          <path d="M382 24h18v18h-18zM388 18h18v18" opacity={0.6} />
        </svg>
      </div>
    </div>
  );
};

// Safari's share sheet, in the app's dark style; the fifth row is the one we want.
const Sheet = ({f}: {f: number}) => {
  const up = prog(f, SHEET_UP, 18);
  const down = prog(f, SHEET_DOWN, 14);
  if (f < SHEET_UP) return null;
  return (
    <div style={{position: 'absolute', left: 0, right: 0, top: SCREEN.h - SHEET_H * up + SHEET_H * down, height: SHEET_H + 40, borderRadius: '28px 28px 0 0', background: C.raised, boxShadow: '0 -20px 60px oklch(0 0 0 / 0.25)', fontFamily: body}}>
      <div style={{position: 'absolute', top: 10, left: '50%', width: 40, height: 5, marginLeft: -20, borderRadius: 3, background: C.lineStrong}} />
      <div style={{position: 'absolute', top: 30, left: 22, display: 'flex', alignItems: 'center', gap: 14}}>
        <Logo size={46} />
        <div>
          <div style={{fontSize: 19, fontWeight: 800, color: C.ink}}>Arus</div>
          <div style={{fontSize: 13, color: C.inkFaint}}>arus-finance.farizz-a.workers.dev</div>
        </div>
      </div>
      <div style={{position: 'absolute', top: 96, left: 0, right: 0, height: 1, background: C.line}} />
      {ROWS.map((label, i) => {
        const picked = i === PICK;
        const lit = picked ? prog(f, ROW_AT, 10) : 0;
        const color = lit > 0 ? C.accentInk : picked ? C.ink : C.inkSoft;
        return (
          <div key={label} style={{position: 'absolute', top: 110 + i * 62, left: 14, right: 14, height: 56, borderRadius: 14, display: 'flex', alignItems: 'center', gap: 16, padding: '0 16px', boxSizing: 'border-box', background: `oklch(0.95 0.045 160 / ${lit})`, fontSize: 19, fontWeight: picked ? 800 : 600, color, transform: `translateX(${picked ? kick(f, TAP_ROW, 4, 5) : 0}px)`}}>
            <svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" style={{flex: 'none'}}>
              <path d={ICONS[i]} />
            </svg>
            {label}
          </div>
        );
      })}
    </div>
  );
};

// Chrome on Android: address bar on top with the ⋮ menu; the menu drops from its corner.
const ChromeView = ({f}: {f: number}) => {
  const open = prog(f, MENU_AT, 14, back);
  const close = prog(f, TAP_ROW2 + 10, 10);
  return (
    <div style={{position: 'absolute', inset: 0, background: C.surface, fontFamily: body}}>
      <div style={{position: 'absolute', left: 0, right: 0, top: 0, height: 92, background: C.raised, borderBottom: `1px solid ${C.line}`}}>
        <div style={{position: 'absolute', top: 36, left: 18, right: 64, height: 42, borderRadius: 21, background: C.sunken, display: 'flex', alignItems: 'center', paddingLeft: 18, fontSize: 16, fontWeight: 600, color: C.ink}}>
          arus-finance.farizz-a.workers.dev
        </div>
        <svg width={24} height={24} viewBox="0 0 24 24" style={{position: 'absolute', left: DOTS.x - 12, top: DOTS.y - 12}} fill={C.ink}>
          <circle cx={12} cy={5} r={2.4} />
          <circle cx={12} cy={12} r={2.4} />
          <circle cx={12} cy={19} r={2.4} />
        </svg>
      </div>
      <Dashboard f={f} top={92} />
      {f >= MENU_AT && (
        <div style={{position: 'absolute', top: 70, right: 12, width: MENU_W, padding: '14px 0', borderRadius: 18, background: C.raised, boxShadow: '0 24px 60px oklch(0 0 0 / 0.3)', transformOrigin: 'top right', transform: `scale(${0.85 + 0.15 * open})`, opacity: Math.min(prog(f, MENU_AT, 8), 1 - close)}}>
          {MENU.map((label, i) => {
            const picked = i === PICK2;
            const lit = picked ? prog(f, ROW2_AT, 10) : 0;
            const color = lit > 0 ? C.accentInk : picked ? C.ink : C.inkSoft;
            return (
              <div key={label} style={{height: 54, margin: '0 10px', borderRadius: 12, display: 'flex', alignItems: 'center', gap: 14, padding: '0 14px', background: `oklch(0.95 0.045 160 / ${lit})`, fontSize: 18, fontWeight: picked ? 800 : 600, color, transform: `translateX(${picked ? kick(f, TAP_ROW2, 4, 5) : 0}px)`}}>
                <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" style={{flex: 'none'}}>
                  <path d={MENU_ICONS[i]} />
                </svg>
                {label}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

// A home screen of neutral tiles, one slot empty until Arus pops into it. The Android one has a search pill for a dock.
const HomeScreen = ({f, android = false}: {f: number; android?: boolean}) => {
  const icon = prog(f, ICON_AT, 20, back);
  return (
    <div style={{position: 'absolute', inset: 0, background: 'linear-gradient(160deg, oklch(0.34 0.06 210), oklch(0.2 0.05 265))'}}>
      {Array.from({length: 20}, (_, i) => {
        const r = Math.floor(i / 4);
        const c = i % 4;
        const x = 24 + c * 104;
        const y = 90 + r * 120;
        if (r === SLOT.r && c === SLOT.c) {
          return (
            <div key={i} style={{position: 'absolute', left: x, top: y, width: 76, textAlign: 'center', opacity: prog(f, ICON_AT, 6), transform: `scale(${0.6 + 0.4 * icon}) rotate(${spin(f, ICON_AT, 24, -200)}deg)`}}>
              <Logo size={76} />
              <div style={{marginTop: 8, fontFamily: body, fontSize: 14, fontWeight: 600, color: '#fff'}}>Arus</div>
            </div>
          );
        }
        return (
          <div key={i} style={{position: 'absolute', left: x, top: y, width: 76}}>
            <div style={{width: 76, height: 76, borderRadius: 18, background: tileColor(i)}} />
            <div style={{width: 40, height: 7, margin: '10px auto 0', borderRadius: 4, background: 'oklch(1 0 0 / 0.45)'}} />
          </div>
        );
      })}
      {android ? (
        <div style={{position: 'absolute', left: 24, right: 24, bottom: 30, height: 64, borderRadius: 32, background: 'oklch(1 0 0 / 0.16)', display: 'flex', alignItems: 'center', gap: 14, padding: '0 22px', boxSizing: 'border-box'}}>
          <svg width={26} height={26} viewBox="0 0 24 24" fill="none" stroke="oklch(1 0 0 / 0.8)" strokeWidth={2.2} strokeLinecap="round">
            <circle cx={11} cy={11} r={7} />
            <path d="M20 20l-4-4" />
          </svg>
          <div style={{width: 120, height: 10, borderRadius: 5, background: 'oklch(1 0 0 / 0.4)'}} />
        </div>
      ) : (
        <div style={{position: 'absolute', left: 18, right: 18, bottom: 22, height: 96, borderRadius: 30, background: 'oklch(1 0 0 / 0.14)', display: 'flex', justifyContent: 'space-evenly', alignItems: 'center'}}>
          {[20, 21, 22, 23].map((i) => (
            <div key={i} style={{width: 72, height: 72, borderRadius: 18, background: tileColor(i)}} />
          ))}
        </div>
      )}
    </div>
  );
};

const Chip = ({text, struck, show, f}: {text: string; struck?: number; show: number; f: number}) => (
  <div style={{position: 'absolute', top: 268, width: '100%', display: 'flex', justifyContent: 'center', opacity: show}}>
    <div style={{position: 'relative', padding: '12px 30px', borderRadius: 999, background: C.raised, border: `2px solid ${C.line}`, fontFamily: body, fontWeight: 800, fontSize: 34, color: struck ? C.inkFaint : C.ink, transform: `translateY(${(1 - show) * 24}px) translateX(${struck !== undefined ? kick(f, STORE_AT, 8, 6) : 0}px)`}}>
      {text}
      {struck !== undefined && <span style={{position: 'absolute', left: 22, right: 22, top: '50%', height: 6, borderRadius: 3, background: C.expense, transform: `scaleX(${struck})`, transformOrigin: 'left'}} />}
    </div>
  </div>
);

// The camera goes where the finger goes: share button, sheet row, home-screen slot, ⋮ menu, menu row.
// Close-ups all the way: the phone, the struck store chip, the address bar, then each thing the finger touches.
const CHIP_XY = {x: 540, y: 297};
const URL_XY = toScene({x: SCREEN.w / 2, y: SCREEN.h - 150 + 16 + 22});
export const camera: CameraKey[] = [
  {at: 0, zoom: 1.5, x: 540, y: 980, dur: 1},
  {at: STORE_AT - 20, zoom: 2.2, x: CHIP_XY.x, y: CHIP_XY.y, dur: 26},
  {at: URL_AT - 10, zoom: 2.4, x: URL_XY.x, y: URL_XY.y, dur: 24},
  {at: TAP_SHARE - 14, zoom: 2, x: SHARE.x, y: SHARE.y - 40, dur: 26},
  {at: SHEET_UP + 8, zoom: 1.8, x: ROW.x, y: ROW.y - 40, dur: 30},
  {at: SHEET_DOWN, zoom: 1.3, x: 540, y: 900, dur: 24},
  {at: ICON_AT - 6, zoom: 2, x: SLOT_XY.x, y: SLOT_XY.y, dur: 26},
  {at: CAPTION_AT + 10, zoom: 1.2, x: 540, y: 1000, dur: 30},
  {at: TAP_MENU - 14, zoom: 2.2, x: DOTS_XY.x - 40, y: DOTS_XY.y + 60, dur: 26},
  {at: MENU_AT + 10, zoom: 1.8, x: ROW2.x, y: ROW2.y, dur: 30},
  {at: TAP_ROW2 + 6, zoom: 1.2, x: 540, y: 1000, dur: 18},
  {at: AGAIN_AT + 16, zoom: 1.8, x: SLOT_XY.x, y: SLOT_XY.y, dur: 26},
];

export const Scene = () => {
  const f = useCurrentFrame();
  const phoneIn = prog(f, 0, 26);
  const home = prog(f, HOME_AT, 14);
  const android = prog(f, ANDROID_AT, 14);
  const again = prog(f, AGAIN_AT, 14);
  const store = prog(f, STORE_AT, 12);
  const dim = 0.45 * prog(f, SHEET_UP, 18) * (1 - prog(f, SHEET_DOWN, 14));

  return (
    <AbsoluteFill>
      {/* Nothing to download: the store chip is struck through. Later the chip names the Android route. */}
      <Chip text="App Store" struck={store} show={prog(f, 8, 20) * (1 - android)} f={f} />
      <Chip text="Android · Chrome" show={android} f={f} />
      {/* The iPhone: Safari, the share sheet, the home screen. */}
      <Phone w={PHONE.w} h={PHONE.h} screen={C.surface} style={{left: PHONE.left, top: PHONE.top, borderRadius: 78, opacity: phoneIn * (1 - android), transform: `translateY(${(1 - phoneIn) * 90}px) scale(${1 - 0.03 * android})`}}>
        <div style={{position: 'absolute', inset: 0, opacity: 1 - home, transform: `scale(${1 - 0.04 * home})`}}>
          <SafariView f={f} />
          <div style={{position: 'absolute', inset: 0, background: `oklch(0 0 0 / ${dim.toFixed(3)})`}} />
          <Sheet f={f} />
        </div>
        {f >= HOME_AT && (
          <div style={{position: 'absolute', inset: 0, opacity: home, transform: `scale(${1.05 - 0.05 * home})`}}>
            <HomeScreen f={f} />
          </div>
        )}
      </Phone>
      {/* An Android phone takes its place: Chrome, the menu, then its own home screen. */}
      {f >= ANDROID_AT && (
        <Phone variant="android" w={PHONE.w} h={PHONE.h} screen={C.surface} style={{left: PHONE.left, top: PHONE.top, opacity: android, transform: `scale(${0.97 + 0.03 * android})`}}>
          <div style={{position: 'absolute', inset: 0, opacity: 1 - again}}>
            <ChromeView f={f} />
          </div>
          {f >= AGAIN_AT && (
            <div style={{position: 'absolute', inset: 0, opacity: again, transform: `scale(${1.04 - 0.04 * again})`}}>
              <HomeScreen f={f} android />
            </div>
          )}
        </Phone>
      )}
      <Ring f={f} at={TAP_SHARE} x={SHARE.x} y={SHARE.y} r0={16} r1={90} dur={22} />
      <Ring f={f} at={TAP_ROW} x={ROW.x} y={ROW.y} r0={16} r1={110} dur={22} />
      <Ring f={f} at={ICON_AT} x={SLOT_XY.x} y={SLOT_XY.y} r0={40} r1={170} dur={26} />
      <Ring f={f} at={TAP_MENU} x={DOTS_XY.x} y={DOTS_XY.y} r0={16} r1={80} dur={22} />
      <Ring f={f} at={TAP_ROW2} x={ROW2.x} y={ROW2.y} r0={16} r1={110} dur={22} />
      <Ring f={f} at={AGAIN_AT + 8} x={SLOT_XY.x} y={SLOT_XY.y} r0={40} r1={150} dur={26} />
      <div style={{position: 'absolute', top: 1430, width: '100%', textAlign: 'center', fontFamily: body, fontWeight: 800, fontSize: 54, color: C.onBand, ...fadeUp(prog(f, CAPTION_AT, 20))}}>
        Seperti aplikasi <Marker at={CAPTION_AT + 16} f={f}>biasa.</Marker>
      </div>
    </AbsoluteFill>
  );
};
