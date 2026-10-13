// S5 — Any payment screen will do: a bank transfer, a QRIS payment, an e-wallet payment. Arus reads the same
// three things off each (amount, payee, date), files the one you picked, and remembers the payee.
import {AbsoluteFill, interpolateColors, random, useCurrentFrame} from 'remotion';
import {type CameraKey, type Cue, back, cue, fadeUp, lerp, prog, swift} from '../core';
import {Ring, ScanBeam} from '../Fx';
import {Bank, Receipt, Wallet} from '../icons';
import {C, body, display, glass} from '../palette';
import {Sticker} from '../Sticker';

// VO: "Transfer bank, QRIS, atau e-wallet:" | "apa pun layarnya, Arus membaca" | "nominal," | "penerima," | "dan tanggalnya."
//     | "Lalu memasukkannya ke kategori yang kamu PILIH." | "Lain kali, Arus ingat SENDIRI."
const SCAN_AT = cue('S5', 1);
const FIELD_AT = [cue('S5', 2), cue('S5', 3), cue('S5', 4)];
const MOVE_AT = cue('S5', 5); // the fields fly into the transaction row
const CHIP_AT = cue('S5', 5, 0.7); // "…yang kamu PILIH"
const REMEMBER_AT = cue('S5', 6, 0.55); // "…Arus ingat SENDIRI"
const ROW = {x: 100, y: 1130};
const INK = 'oklch(0.27 0.02 180)'; // text on the light screens
const SOFT = 'oklch(0.52 0.02 180)';

export const camera: CameraKey[] = [
  {at: SCAN_AT, zoom: 1.2, x: 540, y: 660, dur: 30},
  {at: MOVE_AT, zoom: 1, dur: 36},
  {at: CHIP_AT - 10, zoom: 1.2, x: 540, y: 1280, dur: 30},
];

// Three screens, each a different kind of payment, each with the three things Arus reads.
const CARD = {x: 100, w: 880, h: 226, gap: 24, top: 300};
const cardTop = (i: number) => CARD.top + i * (CARD.h + CARD.gap);
const LINE = {amount: {y: 56, size: 54}, payee: {y: 126, size: 34}, date: {y: 172, size: 28}};
const SCREENS = [
  {kind: 'TRANSFER BANK', title: 'Transfer Berhasil', amount: 'Rp 152.500', label: 'Ke', payee: 'KEDAI KOPI', date: '07 Okt 2026 · 14:02', at: cue('S5', 0, 0.05), side: -1, tint: 'oklch(0.97 0.005 175)'},
  {kind: 'QRIS', title: 'Pembayaran Berhasil', amount: 'Rp 48.000', label: 'Merchant', payee: 'WARUNG SATE', date: '06 Okt 2026 · 19:40', at: cue('S5', 0, 0.42), side: 1, tint: 'oklch(0.975 0.008 80)'},
  {kind: 'E-WALLET', title: 'Pembayaran Berhasil', amount: 'Rp 120.000', label: 'Penerima', payee: 'TOKO BUKU', date: '04 Okt 2026 · 11:15', at: cue('S5', 0, 0.74), side: -1, tint: 'oklch(0.97 0.01 200)'},
];
const TAGS = ['Nominal', 'Penerima', 'Tanggal'];

// The fields of the first screen fly into the row: where they start, where they land.
const FIELDS = [
  {text: SCREENS[0].amount, from: {x: 160, y: cardTop(0) + LINE.amount.y, size: LINE.amount.size}, to: {x: 590, y: ROW.y + 44, size: 52, color: C.expense}, final: '−Rp 152.500'},
  {text: SCREENS[0].payee, from: {x: 160 + 54, y: cardTop(0) + LINE.payee.y, size: LINE.payee.size}, to: {x: 152, y: ROW.y + 44, size: 52, color: C.ink}, final: 'KEDAI KOPI'},
  {text: '07 Okt 2026', from: {x: 160, y: cardTop(0) + LINE.date.y, size: LINE.date.size}, to: {x: 152, y: ROW.y + 150, size: 36, color: C.inkFaint}, final: '07 Okt 2026 · BCA'},
];

export const sfx: Cue[] = [
  ...SCREENS.map((s) => ({at: s.at, sound: 'click', volume: 0.45})),
  {at: SCAN_AT, sound: 'whoosh', volume: 0.35},
  ...FIELD_AT.map((at) => ({at, sound: 'tick', volume: 0.5})),
  {at: CHIP_AT, sound: 'snap', volume: 0.7},
  {at: REMEMBER_AT, sound: 'click', volume: 0.5},
];

// A QR code stand-in: seeded squares, no real code.
const Qr = () => (
  <svg width={64} height={64} viewBox="0 0 11 11" style={{display: 'block'}}>
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
  const move = prog(f, MOVE_AT, 30);
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
        opacity: prog(f, s.at, 8) * (1 - move),
        transform: `translateX(${(1 - inP) * s.side * 160}px) translateY(${-30 * move}px) scale(${0.96 + 0.04 * inP})`,
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
      <div style={{position: 'absolute', left: 60, top: LINE.amount.y, fontSize: LINE.amount.size, fontWeight: 800, lineHeight: 1.2, whiteSpace: 'nowrap'}}>{s.amount}</div>
      <div style={{position: 'absolute', left: 60, top: LINE.payee.y, fontSize: LINE.payee.size, fontWeight: 800, lineHeight: 1.2, whiteSpace: 'nowrap'}}>
        <span style={{color: SOFT, fontWeight: 600, marginRight: 14}}>{s.label}</span>
        {s.payee}
      </div>
      <div style={{position: 'absolute', left: 60, top: LINE.date.y, fontSize: LINE.date.size, fontWeight: 600, lineHeight: 1.2, color: SOFT, whiteSpace: 'nowrap'}}>{s.date}</div>
      <div style={{position: 'absolute', right: 56, bottom: 36}}>{i === 0 ? <Bank size={64} color={SOFT} /> : i === 1 ? <Qr /> : <Wallet size={64} color={SOFT} />}</div>
      {/* The same three things light up on every screen. */}
      {(['amount', 'payee', 'date'] as const).map((k, j) => {
        const hl = prog(f, FIELD_AT[j], 16) * (1 - prog(f, MOVE_AT, 10));
        const width = k === 'amount' ? 320 : k === 'payee' ? 440 : 360;
        return <div key={k} style={{position: 'absolute', left: 44, top: LINE[k].y - 8, width, height: LINE[k].size * 1.2 + 16, borderRadius: 16, background: 'oklch(0.76 0.13 170 / 0.28)', border: `3px solid ${C.accentStrong}`, opacity: hl, transform: `scaleX(${0.6 + 0.4 * hl})`, transformOrigin: 'left'}} />;
      })}
    </div>
  );
};

export const Scene = () => {
  const f = useCurrentFrame();
  const rowIn = prog(f, MOVE_AT - 10, 24);
  const chip = prog(f, CHIP_AT, 22, back);

  return (
    <AbsoluteFill>
      {SCREENS.map((_, i) => (
        <Screen key={i} i={i} f={f} />
      ))}
      <ScanBeam f={f} at={SCAN_AT} dur={40} top={CARD.top} height={3 * CARD.h + 2 * CARD.gap} left={CARD.x} right={CARD.x} />
      {/* One tag per field, beside the first screen. */}
      {TAGS.map((tag, j) => {
        const hl = prog(f, FIELD_AT[j], 16) * (1 - prog(f, MOVE_AT, 10));
        const k = (['amount', 'payee', 'date'] as const)[j];
        return (
          <div key={tag} style={{position: 'absolute', left: CARD.x + CARD.w - 300, top: cardTop(0) + LINE[k].y + [-6, -14, 4][j], padding: '7px 22px', borderRadius: 999, background: C.accentSoft, color: C.accentStrong, fontFamily: body, fontWeight: 800, fontSize: 30, whiteSpace: 'nowrap', ...fadeUp(hl, 16)}}>
            {tag}
          </div>
        );
      })}

      <Sticker Icon={Receipt} x={440} y={600} at={MOVE_AT + 24} f={f} tilt={-5} size={200} />

      {/* The transaction row the fields land in. */}
      <div style={{position: 'absolute', top: ROW.y - 90, left: ROW.x, fontFamily: display, fontWeight: 700, fontSize: 40, color: C.inkSoft, ...fadeUp(rowIn)}}>
        Transaksi baru
      </div>
      <div style={{...glass, ...fadeUp(rowIn, 40), position: 'absolute', top: ROW.y, left: ROW.x, width: 880, height: 300}}>
        <span style={{position: 'absolute', left: 380, top: 136, padding: '10px 30px', borderRadius: 999, background: C.accentSoft, color: C.accentStrong, fontFamily: body, fontWeight: 800, fontSize: 36, opacity: chip, transform: `scale(${0.6 + 0.4 * chip})`}}>
          Makan
        </span>
        {/* Learned: the next receipt to this payee files itself. */}
        <span style={{position: 'absolute', left: 590, top: 140, display: 'flex', alignItems: 'center', gap: 10, padding: '8px 22px', borderRadius: 999, background: C.income, color: C.surface, fontFamily: body, fontWeight: 800, fontSize: 30, opacity: prog(f, REMEMBER_AT, 8), transform: `scale(${0.6 + 0.4 * prog(f, REMEMBER_AT, 20, back)})`}}>
          <svg width={26} height={26} viewBox="0 0 24 24">
            <path d="M5 12.5l4.5 4.5L19 7.5" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" fill="none" />
          </svg>
          Diingat
        </span>
      </div>
      <Ring f={f} at={CHIP_AT} x={ROW.x + 450} y={ROW.y + 167} r0={30} r1={140} dur={26} color={C.accent} />
      <Ring f={f} at={REMEMBER_AT} x={ROW.x + 680} y={ROW.y + 167} r0={30} r1={140} dur={26} color={C.income} />

      {/* The first screen's fields fly into the row, shrinking and recolouring as they land. */}
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
