// S5 — Any payment screen will do: a bank transfer, a QRIS payment, an e-wallet payment. Then one of them,
// a QRIS receipt on the phone, is read: amount, merchant, date; it is filed under the category you picked.
import {AbsoluteFill, interpolateColors, random, useCurrentFrame} from 'remotion';
import {type CameraKey, type Cue, back, cue, fadeUp, lerp, prog, swift} from '../core';
import {Ring, ScanBeam} from '../Fx';
import {Bank, Receipt, Wallet} from '../icons';
import {Tile} from '../lucide';
import {C, body, display, panel} from '../palette';
import {Phone, bezel} from '../Phone';
import {Sticker} from '../Sticker';

// VO: "Transfer bank, QRIS, atau e-wallet:" | "apa pun layarnya, Arus membaca" | "nominal," | "penerima," | "dan tanggalnya."
//     | "Lalu memasukkannya ke kategori yang kamu PILIH." | "Lain kali, Arus ingat SENDIRI."
const FOCUS_AT = cue('S5', 1); // "apa pun layarnya": the small screens leave, the QRIS receipt comes up on a phone
const SCAN_AT = FOCUS_AT + 24;
const FIELD_AT = [cue('S5', 2), cue('S5', 3), cue('S5', 4)];
const MOVE_AT = cue('S5', 5); // the fields fly into the transaction row
const CHIP_AT = cue('S5', 5, 0.7); // "…yang kamu PILIH"
const REMEMBER_AT = cue('S5', 6, 0.55); // "…Arus ingat SENDIRI"
const ROW = {x: 100, y: 1200};
const INK = 'oklch(0.27 0.02 180)'; // text on the light screens
const SOFT = 'oklch(0.52 0.02 180)';

// The phone with the QRIS receipt: a real phone's proportions (about 19.5:9).
const PHONE = {left: 320, top: 200, w: 440, h: 950};
const BZ = bezel(PHONE.w, PHONE.h);
const SCREEN = {w: BZ.screenW, h: BZ.screenH};
// Where the three things sit on the receipt (screen px): amount centred, merchant centred, the date's value right-aligned.
// Laid out on an 8 px rhythm below the island's safe area: status, title, amount, merchant, details, one action.
const LINE = {
  amount: {y: 244, size: 56, box: {left: 56, width: SCREEN.w - 112}},
  payee: {y: 358, size: 30, box: {left: 72, width: SCREEN.w - 144}},
  date: {y: 468, size: 22, box: {left: SCREEN.w - 24 - 232, width: 232}},
};
const toScene = (x: number, y: number) => ({x: PHONE.left + BZ.inset + x, y: PHONE.top + BZ.inset + y});

export const camera: CameraKey[] = [
  {at: 0, zoom: 1.3, x: 540, y: 413, dur: 1},
  {at: cue('S5', 0, 0.42) - 10, zoom: 1, dur: 30},
  // Tight on the receipt; the focus sits right of centre so the tags beside the phone stay in frame.
  {at: FOCUS_AT + 10, zoom: 1.45, x: 750, y: 560, dur: 30},
  {at: MOVE_AT, zoom: 1, dur: 36},
  {at: CHIP_AT - 10, zoom: 1.2, x: 540, y: 1280, dur: 30},
];

// Three small screens, each a different kind of payment, for the list in the voice.
const CARD = {x: 100, w: 880, h: 226, gap: 24, top: 300};
const cardTop = (i: number) => CARD.top + i * (CARD.h + CARD.gap);
const SCREENS = [
  {kind: 'TRANSFER BANK', title: 'Transfer Berhasil', amount: 'Rp 152.500', label: 'Ke', payee: 'KEDAI KOPI', date: '07 Okt 2026 · 14:02', at: cue('S5', 0, 0.05), side: -1, tint: 'oklch(0.97 0.005 175)'},
  {kind: 'QRIS', title: 'Pembayaran Berhasil', amount: 'Rp 48.000', label: 'Merchant', payee: 'WARUNG SATE', date: '06 Okt 2026 · 19:40', at: cue('S5', 0, 0.42), side: 1, tint: 'oklch(0.975 0.008 80)'},
  {kind: 'E-WALLET', title: 'Pembayaran Berhasil', amount: 'Rp 120.000', label: 'Penerima', payee: 'TOKO BUKU', date: '04 Okt 2026 · 11:15', at: cue('S5', 0, 0.74), side: -1, tint: 'oklch(0.97 0.01 200)'},
];
const TAGS = ['Nominal', 'Penerima', 'Tanggal'];

// The receipt's fields fly into the row: where they start (scene px), where they land.
const FIELDS = [
  {text: 'Rp 48.000', from: {...toScene(SCREEN.w / 2 - 150, LINE.amount.y), size: LINE.amount.size}, to: {x: 660, y: ROW.y + 46, size: 46, color: C.expense}, final: '−Rp 48.000'},
  {text: 'WARUNG SATE', from: {...toScene(SCREEN.w / 2 - 118, LINE.payee.y), size: LINE.payee.size}, to: {x: 252, y: ROW.y + 46, size: 46, color: C.ink}, final: 'WARUNG SATE'},
  {text: '06 Okt 2026', from: {...toScene(LINE.date.box.left + 8, LINE.date.y), size: LINE.date.size}, to: {x: 252, y: ROW.y + 150, size: 36, color: C.inkSoft}, final: '06 Okt 2026 · BCA'},
];

export const sfx: Cue[] = [
  ...SCREENS.map((s) => ({at: s.at, sound: 'click', volume: 0.45})),
  {at: FOCUS_AT, sound: 'whoosh', volume: 0.3},
  {at: SCAN_AT, sound: 'whoosh', volume: 0.35},
  ...FIELD_AT.map((at) => ({at, sound: 'tick', volume: 0.5})),
  {at: CHIP_AT, sound: 'snap', volume: 0.7},
  {at: REMEMBER_AT, sound: 'click', volume: 0.5},
];

// A QR code stand-in: seeded squares, no real code.
const Qr = ({size = 64}: {size?: number}) => (
  <svg width={size} height={size} viewBox="0 0 11 11" style={{display: 'block'}}>
    {Array.from({length: 121}, (_, i) => {
      const x = i % 11;
      const y = Math.floor(i / 11);
      const corner = (x < 3 && y < 3) || (x > 7 && y < 3) || (x < 3 && y > 7);
      const on = corner ? (x === 1 && y === 1) || (x === 9 && y === 1) || (x === 1 && y === 9) || x === 0 || x === 2 || y === 0 || y === 2 || x === 8 || x === 10 || y === 8 || y === 10 : random(`qr-${i}`) > 0.55;
      return on ? <rect key={i} x={x} y={y} width={1} height={1} fill={INK} /> : null;
    })}
  </svg>
);

const Screen = ({i, f}: {i: number; f: number}) => {
  const s = SCREENS[i];
  const inP = prog(f, s.at, 22, back);
  const away = prog(f, FOCUS_AT, 26);
  return (
    <div
      style={{
        position: 'absolute',
        left: CARD.x,
        top: cardTop(i),
        width: CARD.w,
        height: CARD.h,
        borderRadius: 32,
        background: s.tint,
        boxShadow: '0 30px 60px -30px oklch(0 0 0 / 0.5)',
        fontFamily: body,
        color: INK,
        opacity: prog(f, s.at, 8) * (1 - away),
        transform: `translateX(${(1 - inP) * s.side * 160 + away * s.side * 1100}px) scale(${0.96 + 0.04 * inP})`,
      }}
    >
      <div style={{position: 'absolute', left: 60, top: 22, fontSize: 20, fontWeight: 800, letterSpacing: 3, color: SOFT}}>{s.kind}</div>
      <div style={{position: 'absolute', right: 60, top: 18, fontSize: 24, fontWeight: 700, color: 'oklch(0.55 0.15 150)', display: 'flex', alignItems: 'center', gap: 10}}>
        <svg width={26} height={26} viewBox="0 0 24 24">
          <circle cx={12} cy={12} r={12} fill="oklch(0.62 0.15 150)" />
          <path d="M6.5 12.5l3.5 3.5 7.5-8" stroke="#fff" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" fill="none" />
        </svg>
        {s.title}
      </div>
      <div style={{position: 'absolute', left: 60, top: 56, fontSize: 54, fontWeight: 800, lineHeight: 1.2, whiteSpace: 'nowrap'}}>{s.amount}</div>
      <div style={{position: 'absolute', left: 60, top: 126, fontSize: 34, fontWeight: 800, lineHeight: 1.2, whiteSpace: 'nowrap'}}>
        <span style={{color: SOFT, fontWeight: 600, marginRight: 14}}>{s.label}</span>
        {s.payee}
      </div>
      <div style={{position: 'absolute', left: 60, top: 172, fontSize: 28, fontWeight: 600, lineHeight: 1.2, color: SOFT, whiteSpace: 'nowrap'}}>{s.date}</div>
      <div style={{position: 'absolute', right: 56, bottom: 36}}>{i === 0 ? <Bank size={64} color={SOFT} /> : i === 1 ? <Qr /> : <Wallet size={64} color={SOFT} />}</div>
    </div>
  );
};

// The QRIS payment receipt, as the phone shows it after paying. No brand marks.
const QrisReceipt = ({f}: {f: number}) => {
  const Row = ({k, v, y, strong, boxed}: {k: string; v: string; y: number; strong?: boolean; boxed?: number}) => (
    <div style={{position: 'absolute', left: 24, right: 24, top: y, display: 'flex', justifyContent: 'space-between', fontSize: 22, lineHeight: 1.2}}>
      <span style={{color: SOFT, fontWeight: 600}}>{k}</span>
      <span style={{position: 'relative', fontWeight: strong ? 800 : 700, color: INK}}>
        {v}
        {boxed !== undefined && <Highlight p={boxed} inset />}
      </span>
    </div>
  );
  const hl = (j: number) => prog(f, FIELD_AT[j], 16) * (1 - prog(f, MOVE_AT, 10));
  return (
    <div style={{position: 'absolute', inset: 0, background: 'oklch(0.985 0.004 80)', fontFamily: body, color: INK}}>
      <svg width={88} height={88} viewBox="0 0 24 24" style={{position: 'absolute', left: '50%', top: 96, marginLeft: -44}}>
        <circle cx={12} cy={12} r={12} fill="oklch(0.62 0.15 150)" />
        <path d="M6.5 12.5l3.5 3.5 7.5-8" stroke="#fff" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" fill="none" />
      </svg>
      <div style={{position: 'absolute', left: 0, right: 0, top: 200, textAlign: 'center', fontSize: 26, fontWeight: 800}}>Pembayaran Berhasil</div>
      <div style={{position: 'absolute', left: 0, right: 0, top: LINE.amount.y, textAlign: 'center', fontSize: LINE.amount.size, fontWeight: 800, letterSpacing: -1, lineHeight: 1.2}}>Rp 48.000</div>
      <div style={{position: 'absolute', left: '50%', top: 322, transform: 'translateX(-50%)', padding: '3px 12px', borderRadius: 999, background: 'oklch(0.93 0.03 80)', fontSize: 15, fontWeight: 800, letterSpacing: 2, color: SOFT}}>QRIS</div>
      <div style={{position: 'absolute', left: 0, right: 0, top: LINE.payee.y, textAlign: 'center', fontSize: LINE.payee.size, fontWeight: 800, lineHeight: 1.2}}>WARUNG SATE</div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 398, textAlign: 'center', fontSize: 18, fontWeight: 600, color: SOFT}}>Jl. Kemang Raya No. 12, Jakarta Selatan</div>
      <div style={{position: 'absolute', left: 24, right: 24, top: 440, height: 2, background: 'oklch(0.9 0.01 80)'}} />
      <Row k="Tanggal" v="06 Okt 2026 · 19:40" y={LINE.date.y} boxed={hl(2)} />
      <Row k="No. Referensi" v="2610 0619 4021" y={510} />
      <Row k="Sumber dana" v="BCA ···· 1234" y={552} />
      <Row k="Biaya admin" v="Rp 0" y={594} />
      <div style={{position: 'absolute', left: 24, right: 24, top: 636, height: 2, background: 'oklch(0.9 0.01 80)'}} />
      <Row k="Total" v="Rp 48.000" y={660} strong />
      <div style={{position: 'absolute', left: 24, right: 24, bottom: 44, height: 56, borderRadius: 999, background: C.accentStrong, color: C.onAccent, display: 'grid', placeItems: 'center', fontSize: 20, fontWeight: 800}}>Selesai</div>
      <div style={{position: 'absolute', right: 24, top: 68, opacity: 0.9}}>
        <Qr size={40} />
      </div>
      {/* The three things Arus reads light up, in turn. */}
      <Highlight p={hl(0)} box={{left: LINE.amount.box.left, top: LINE.amount.y - 8, width: LINE.amount.box.width, height: LINE.amount.size * 1.2 + 16}} />
      <Highlight p={hl(1)} box={{left: LINE.payee.box.left, top: LINE.payee.y - 8, width: LINE.payee.box.width, height: LINE.payee.size * 1.2 + 16}} />
      <ScanBeam f={f} at={SCAN_AT} dur={30} top={64} height={SCREEN.h - 128} />
    </div>
  );
};

const Highlight = ({p, box, inset}: {p: number; box?: {left: number; top: number; width: number; height: number}; inset?: boolean}) => (
  <div style={{position: 'absolute', ...(inset ? {inset: '-6px -10px'} : box), borderRadius: 14, background: 'oklch(0.76 0.13 170 / 0.28)', border: `3px solid ${C.accentStrong}`, opacity: p, transform: `scaleX(${0.6 + 0.4 * p})`, transformOrigin: 'left'}} />
);

export const Scene = () => {
  const f = useCurrentFrame();
  const phoneIn = prog(f, FOCUS_AT + 6, 26, back);
  const move = prog(f, MOVE_AT, 40);
  const rowIn = prog(f, MOVE_AT - 10, 24);
  const chip = prog(f, CHIP_AT, 22, back);

  return (
    <AbsoluteFill>
      {SCREENS.map((_, i) => (
        <Screen key={i} i={i} f={f} />
      ))}
      {f >= FOCUS_AT + 6 && (
        <Phone w={PHONE.w} h={PHONE.h} screen="oklch(0.985 0.004 80)" style={{left: PHONE.left, top: PHONE.top, opacity: Math.min(prog(f, FOCUS_AT + 6, 10), 1 - move), transform: `translateY(${(1 - phoneIn) * 120 - move * 40}px)`}}>
          <QrisReceipt f={f} />
        </Phone>
      )}
      {/* One tag per field, beside the phone. */}
      {TAGS.map((tag, j) => {
        const hl = prog(f, FIELD_AT[j], 16) * (1 - prog(f, MOVE_AT, 10));
        const k = (['amount', 'payee', 'date'] as const)[j];
        return (
          <div key={tag} style={{position: 'absolute', left: PHONE.left + PHONE.w + 16, top: PHONE.top + BZ.inset + LINE[k].y - 4, padding: '7px 22px', borderRadius: 999, background: C.accentSoft, color: C.accentStrong, fontFamily: body, fontWeight: 800, fontSize: 30, whiteSpace: 'nowrap', ...fadeUp(hl, 16)}}>
            {tag}
          </div>
        );
      })}

      <Sticker Icon={Receipt} x={440} y={640} at={MOVE_AT + 40} f={f} tilt={-5} size={200} />

      {/* The transaction row the fields land in. */}
      <div style={{position: 'absolute', top: ROW.y - 70, left: ROW.x, fontFamily: display, fontWeight: 700, fontSize: 40, color: C.onBandSoft, ...fadeUp(rowIn)}}>
        Transaksi baru
      </div>
      <div style={{...panel, ...fadeUp(rowIn, 40), position: 'absolute', top: ROW.y, left: ROW.x, width: 880, height: 300}}>
        <div style={{position: 'absolute', left: 44, top: 44, opacity: prog(f, MOVE_AT + 30, 12)}}>
          <Tile icon="utensils" tone="tangerine" size="lg" scale={1.5} />
        </div>
        <span style={{position: 'absolute', left: 480, top: 136, padding: '10px 30px', borderRadius: 999, background: C.accentSoft, color: C.accentStrong, fontFamily: body, fontWeight: 800, fontSize: 36, opacity: chip, transform: `scale(${0.6 + 0.4 * chip})`}}>
          Makan
        </span>
        {/* Learned: the next receipt to this payee files itself. */}
        <span style={{position: 'absolute', left: 672, top: 140, display: 'flex', alignItems: 'center', gap: 10, padding: '8px 22px', borderRadius: 999, background: C.income, color: C.onAccent, fontFamily: body, fontWeight: 800, fontSize: 30, opacity: prog(f, REMEMBER_AT, 8), transform: `scale(${0.6 + 0.4 * prog(f, REMEMBER_AT, 20, back)})`}}>
          <svg width={26} height={26} viewBox="0 0 24 24">
            <path d="M5 12.5l4.5 4.5L19 7.5" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" fill="none" />
          </svg>
          Diingat
        </span>
      </div>
      <Ring f={f} at={CHIP_AT} x={ROW.x + 550} y={ROW.y + 167} r0={30} r1={140} dur={26} color={C.accent} />
      <Ring f={f} at={REMEMBER_AT} x={ROW.x + 762} y={ROW.y + 167} r0={30} r1={140} dur={26} color={C.income} />

      {/* The receipt's fields fly into the row, shrinking and recolouring as they land. */}
      {FIELDS.map(({text, final, from, to}, i) => {
        const p = prog(f, MOVE_AT + i * 6, 34, swift);
        const landed = f >= MOVE_AT + i * 6 + 34;
        return (
          <div
            key={text}
            style={{
              position: 'absolute',
              left: lerp(from.x, to.x, p),
              top: lerp(from.y, to.y, p) - Math.sin(p * Math.PI) * 90,
              fontFamily: body,
              fontWeight: 800,
              fontSize: lerp(from.size, to.size, p),
              lineHeight: 1.2,
              color: interpolateColors(Math.sqrt(p), [0, 1], [INK, to.color]),
              whiteSpace: 'nowrap',
              opacity: f >= MOVE_AT ? 1 : 0,
            }}
          >
            {landed ? final : text}
          </div>
        );
      })}
    </AbsoluteFill>
  );
};
