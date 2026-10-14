// S6 — Step 4, try it: the receipt, two knocks, the scan. A new screen and a new payee, so Arus asks once: the
// Shortcut's list offers the accounts (BCA picked), then the categories (Makan picked); the notification lands
// and both answers are remembered.
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {type CameraKey, type Cue, prog} from '../../lib/core';
import {ScanBeam} from '../../lib/Fx';
import {E, Tap, hitPulse, usePhoneIn} from '../../lib/motion';
import {C, body} from '../../lib/palette';
import {STAGE, STAGE_SCREEN_H as SH, STAGE_ZOOM as Z, StagePhone, onStage} from '../../lib/Phone';
import {KnockTag, LIST_ROW, ListSheet, Notification, RECEIPT_TEXT, Receipt, StepChip, knock} from '../parts';
import {cue} from '../voice';

// VO: "Sekarang coba." | "Buka struk transfer, ketuk dua kali." | "Struk pertama?" | "Arus bertanya SEKALI:"
//     | "akun yang mana," | "kategori apa."
const KNOCKS = [cue('S6', 1, 0.6), cue('S6', 1, 0.75)];
const SCAN_AT = KNOCKS[1] + 10;
const NEW_AT = cue('S6', 2, 0.1); // "layar baru"
const SHEET_UP = cue('S6', 3, 0.05);
const BCA_AT = cue('S6', 4, 0.75);
const SWAP_AT = cue('S6', 5) - 4; // the list becomes the categories
const MAKAN_AT = cue('S6', 5, 0.6);
const SHEET_DOWN = MAKAN_AT + 6;
const NOTIF_AT = SHEET_DOWN + 12;
const REMEMBER_AT = NOTIF_AT + 18;

const ACCOUNTS = ['BCA', 'E-wallet', 'Tunai'];
const CATEGORIES = ['Belanja', 'Hiburan', 'Lainnya', 'Makan', 'Tagihan', 'Transport'];
const TITLE = 'Which account paid Rp 152.500 to KEDAI KOPI, and what was it for?';
/** Centre (app px) of list row i in a sheet of n rows: the sheet sits 8 px off the bottom, with Batal under it. */
const rowAt = (i: number, n: number) => ({x: 197, y: SH - 8 - 10 - 46 - 10 - (n - i) * LIST_ROW + LIST_ROW / 2});

export const camera: CameraKey[] = [
  {at: 0, zoom: 1.25, x: 540, y: onStage(0, 330).y, dur: 1},
  {at: SHEET_UP + 4, zoom: 1.35, x: 540, y: onStage(0, 620).y},
  {at: SHEET_DOWN + 6, zoom: 1.35, x: 540, y: onStage(0, 160).y},
];

export const sfx: Cue[] = [
  ...KNOCKS.map((at) => ({at, sound: 'thud', volume: 0.6})),
  {at: SCAN_AT, sound: 'tone', volume: 0.25},
  {at: NEW_AT, sound: 'click', volume: 0.5},
  {at: SHEET_UP, sound: 'whoosh', volume: 0.35},
  {at: BCA_AT, sound: 'tap', volume: 0.7},
  {at: SWAP_AT, sound: 'whoosh', volume: 0.2},
  {at: MAKAN_AT, sound: 'tap', volume: 0.7},
  {at: NOTIF_AT, sound: 'ding', volume: 0.6},
  {at: REMEMBER_AT, sound: 'snap', volume: 0.5},
];

export const Scene = () => {
  const f = useCurrentFrame();
  const phoneIn = usePhoneIn();
  const up = prog(f, SHEET_UP, 40, E.glide) * (1 - prog(f, SHEET_DOWN, 22, E.exit));
  const swap = prog(f, SWAP_AT, 18, E.ui);
  const cats = f >= SWAP_AT + 9;
  const bca = onStage(rowAt(0, 3).x, rowAt(0, 3).y);
  const makan = onStage(rowAt(3, 6).x, rowAt(3, 6).y);
  return (
    <AbsoluteFill>
      <StepChip f={f} at={0} n={4} label="Coba" />
      <StagePhone screen="#fff" style={{...phoneIn, translate: `${knock(f, KNOCKS)}px 0`}}>
        <Receipt amount="Rp 152.500" payee="KEDAI KOPI" time="7 Okt 2026, 10:31" refNo="2026100710311" />
        <ScanBeam f={f} at={SCAN_AT} dur={36} top={RECEIPT_TEXT.top} height={RECEIPT_TEXT.height} />
        {f >= NEW_AT && (
          <div style={{position: 'absolute', right: 16, top: 118, padding: '6px 14px', borderRadius: 999, background: C.warnSoft, color: C.warn, fontFamily: body, fontSize: 14, fontWeight: 800, opacity: prog(f, NEW_AT, 10, E.smooth), transform: `scale(${prog(f, NEW_AT, 20, E.out) * (1 + 0.1 * hitPulse(f, NEW_AT + 6))})`}}>
            layar baru
          </div>
        )}
        <div style={{position: 'absolute', inset: 0, background: `oklch(0 0 0 / ${(0.35 * up).toFixed(3)})`}} />
        <div style={{position: 'absolute', inset: 0, opacity: 1 - Math.sin(swap * Math.PI) * 0.9}}>
          <ListSheet up={up} title={TITLE} items={cats ? CATEGORIES : ACCOUNTS} lit={cats ? {Makan: hitPulse(f, MAKAN_AT - 8)} : {BCA: hitPulse(f, BCA_AT - 8)}} picked={cats ? (f >= MAKAN_AT ? 'Makan' : undefined) : f >= BCA_AT ? 'BCA' : undefined} />
        </div>
        <Notification f={f} at={NOTIF_AT} check={prog(f, REMEMBER_AT, 12, E.out)}>
          Spent Rp 152.500 · KEDAI KOPI · Makan · BCA
        </Notification>
      </StagePhone>
      <KnockTag f={f} ats={KNOCKS} x={STAGE.left + STAGE.w - 120} y={onStage(0, 520).y} />
      <Tap f={f} at={BCA_AT} x={bca.x} y={bca.y} w={354 * Z} h={LIST_ROW * Z} r={0} />
      <Tap f={f} at={MAKAN_AT} x={makan.x} y={makan.y} w={354 * Z} h={LIST_ROW * Z} r={0} />
      {/* What Arus remembers from this one question. */}
      {['Layar ini → BCA', 'KEDAI KOPI → Makan'].map((t, i) => {
        const at = REMEMBER_AT + i * 6;
        if (f < at) return null;
        return (
          <div key={t} style={{position: 'absolute', left: 0, right: 0, top: onStage(0, 590).y + i * 96, display: 'flex', justifyContent: 'center', opacity: prog(f, at, 10, E.smooth), transform: `translateY(${(1 - prog(f, at, 22, E.out)) * 18}px)`}}>
            <div style={{padding: '12px 24px', borderRadius: 999, background: C.accentStrong, color: '#fff', fontFamily: body, fontSize: 34, fontWeight: 800}}>diingat: {t}</div>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};
