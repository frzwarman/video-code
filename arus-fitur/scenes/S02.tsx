// S2 — Akun: the Accounts page. A new account is added in the sheet (name, type, opening balance, date),
// its card lands, then a transaction is recorded and the balance moves.
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {type CameraKey, type Cue, back, fadeUp, inOut, lerp, prog, roundK, rupiah} from '../../lib/core';
import {Ring} from '../../lib/Fx';
import {APP_W, TabBar} from '../../lib/Home';
import {Tile} from '../../lib/lucide';
import {C, body} from '../../lib/palette';
import {Phone, bezel} from '../../lib/Phone';
import {AccountCard, Button, Chips, Field, Input, PANEL, PageHeader, Sheet, caretOn, typed} from '../../lib/ui';
import {cue} from '../voice';

// VO: "Mulai dari rekeningmu." | "Tambah akun:" | "tunai," | "bank," | "atau e-wallet," | "isi saldo awalnya, selesai."
//     | "Saldonya ikut BERGERAK setiap kali kamu mencatat."
const TAP_NEW = cue('S2', 1, 0.3);
const SHEET_UP = TAP_NEW + 8;
const NAME_AT = cue('S2', 1, 1) + 4; // "BCA" is typed
const LIT = [cue('S2', 2), cue('S2', 3), cue('S2', 4)]; // Cash · Bank account · E-wallet, as the voice names them
const BALANCE_AT = cue('S2', 5, 0.1); // "312.000" is typed
const TAP_CREATE = cue('S2', 5, 0.85); // "selesai"
const SHEET_DOWN = TAP_CREATE + 8;
const CARD_AT = SHEET_DOWN + 14;
const TOAST_AT = cue('S2', 6, 0.35); // a transaction just recorded
const MOVE_AT = cue('S2', 6, 0.55); // "BERGERAK": the balance follows

const PHONE = {left: 240, top: 300, w: 600, h: 1300};
const BZ = bezel(PHONE.w, PHONE.h);
const ZOOM = BZ.screenW / APP_W;
const SCREEN_H = BZ.screenH / ZOOM; // app px
const toScene = (x: number, y: number) => ({x: PHONE.left + BZ.inset + x * ZOOM, y: PHONE.top + BZ.inset + y * ZOOM});
const NEW_BTN = toScene(313, 72);
const CREATE_BTN = toScene(250, SCREEN_H - 52);
const TYPES = [
  {label: 'Cash', icon: 'wallet'},
  {label: 'Bank account', icon: 'landmark'},
  {label: 'E-wallet', icon: 'smartphone'},
] as const;
const glow = (f: number, at: number) => (f >= at ? Math.exp(-(f - at) / 12) : 0);

export const camera: CameraKey[] = [
  {at: 0, zoom: 1.2, x: 540, y: 620, dur: 1},
  {at: SHEET_UP + 6, zoom: 1.45, x: 540, y: 1180, dur: 30},
  {at: SHEET_DOWN, zoom: 1.3, x: 540, y: 820, dur: 30},
  {at: TOAST_AT - 10, zoom: 1.3, x: 540, y: 1100, dur: 30},
];

export const sfx: Cue[] = [
  {at: TAP_NEW, sound: 'tap', volume: 0.8},
  {at: SHEET_UP, sound: 'whoosh', volume: 0.35},
  ...[0, 1, 2].map((i) => ({at: NAME_AT + i * 6, sound: 'tick', volume: 0.35})),
  ...LIT.map((at) => ({at, sound: 'tap', volume: 0.6})),
  ...[0, 1, 2, 3, 4, 5, 6].map((i) => ({at: BALANCE_AT + i * 4, sound: 'tick', volume: 0.3})),
  {at: TAP_CREATE, sound: 'tap', volume: 0.8},
  {at: SHEET_DOWN, sound: 'whoosh', volume: 0.3},
  {at: CARD_AT, sound: 'snap', volume: 0.7},
  {at: TOAST_AT, sound: 'click', volume: 0.5},
  {at: MOVE_AT + 10, sound: 'tick', volume: 0.5},
];

export const Scene = () => {
  const f = useCurrentFrame();
  const phoneIn = prog(f, 0, 26);
  const up = prog(f, SHEET_UP, 22) * (1 - prog(f, SHEET_DOWN, 16));
  const cardIn = prog(f, CARD_AT, 24, back);
  const name = typed('BCA', f, NAME_AT, 10);
  const typingName = f >= NAME_AT && f < NAME_AT + 30;
  const balance = typed('312.000', f, BALANCE_AT, 14);
  const typingBalance = f >= BALANCE_AT && f < BALANCE_AT + 40;
  const bca = roundK(lerp(312_000, 160_000, prog(f, MOVE_AT, 24, inOut)));
  const toast = prog(f, TOAST_AT, 18, back);

  return (
    <AbsoluteFill>
      <Phone w={PHONE.w} h={PHONE.h} screen={C.surface} style={{left: PHONE.left, top: PHONE.top, borderRadius: 96, ...fadeUp(phoneIn, 90)}}>
        <div style={{position: 'absolute', left: 0, top: 0, width: APP_W, height: SCREEN_H, transformOrigin: 'top left', transform: `scale(${ZOOM})`, fontFamily: body, color: C.ink}}>
          <div style={{padding: '48px 16px 16px'}}>
            <PageHeader title="Accounts" subtitle="Balances update from your opening balance and every transaction." action={<Button variant="primary" size="sm" icon="plus">New account</Button>} />
            <div style={{display: 'grid', gap: 12, marginTop: 20}}>
              <AccountCard name="Tunai" kind="cash" balance={rupiah(450_000)} opened="1 Okt 2026" />
              {f >= CARD_AT && (
                <div style={{opacity: prog(f, CARD_AT, 8), transform: `translateY(${(1 - cardIn) * 40}px) scale(${0.9 + 0.1 * cardIn})`}}>
                  <AccountCard name="BCA" kind="bank" balance={rupiah(bca)} opened="13 Okt 2026" lit={prog(f, MOVE_AT, 10) * (1 - prog(f, MOVE_AT + 56, 14))} />
                </div>
              )}
              <AccountCard name="E-wallet" kind="ewallet" balance={rupiah(185_000)} opened="1 Okt 2026" />
            </div>
          </div>
          <TabBar active="" />
          {/* A transaction just recorded: the toast the app shows. */}
          {f >= TOAST_AT && (
            <div style={{position: 'absolute', left: 16, right: 16, bottom: 100, ...PANEL, borderRadius: 16, padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 12, opacity: prog(f, TOAST_AT, 8), transform: `translateY(${(1 - toast) * 40}px)`}}>
              <Tile icon="utensils" tone="tangerine" size="sm" />
              <div style={{flex: 1, minWidth: 0}}>
                <div style={{fontSize: 14, fontWeight: 700}}>KEDAI KOPI</div>
                <div style={{fontSize: 12, color: C.inkSoft}}>Dicatat · BCA · Makan</div>
              </div>
              <div style={{fontSize: 14, fontWeight: 800, color: C.expense, fontVariantNumeric: 'tabular-nums'}}>−Rp 152.000</div>
            </div>
          )}
          <div style={{position: 'absolute', inset: 0, background: `oklch(0 0 0 / ${(0.45 * up).toFixed(3)})`}} />
          <Sheet up={up} title="New account" description="Balances start from the opening balance.">
            <Field label="Name" required>
              <Input value={name} placeholder="e.g. BCA" focus={typingName ? 1 : 0} caret={typingName && caretOn(f)} />
            </Field>
            <Field label="Type" required>
              <Chips options={TYPES.map((t) => ({label: t.label, icon: t.icon}))} value={f >= LIT[1] ? 'Bank account' : undefined} lit={{Cash: glow(f, LIT[0]), 'Bank account': glow(f, LIT[1]), 'E-wallet': glow(f, LIT[2])}} />
            </Field>
            <Field label="Opening balance" required>
              <Input value={balance} placeholder="0" prefix="Rp" focus={typingBalance ? 1 : 0} caret={typingBalance && caretOn(f)} />
            </Field>
            <Field label="Opening date" required>
              <Input value="13 Okt 2026" icon="calendar" />
            </Field>
            <div style={{display: 'flex', gap: 8, marginTop: 4}}>
              <Button variant="ghost">Cancel</Button>
              <Button variant="primary" size="lg" style={{flex: 1}}>
                Create account
              </Button>
            </div>
          </Sheet>
        </div>
      </Phone>
      <Ring f={f} at={TAP_NEW} x={NEW_BTN.x} y={NEW_BTN.y} r0={16} r1={90} dur={22} color={C.accent} />
      <Ring f={f} at={TAP_CREATE} x={CREATE_BTN.x} y={CREATE_BTN.y} r0={16} r1={110} dur={22} color={C.accent} />
    </AbsoluteFill>
  );
};
