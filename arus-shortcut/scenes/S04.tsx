// S4 — Step 2, the Shortcut: back on the quick add card, "Get the Shortcut" (punch-in) opens the shared Shortcut
// "Arus Finances"; it is set up and added, and the one thing it asks for is the token copied in S3.
// (The URL and the public key are already in the shared Shortcut; only p_token is the viewer's own.)
import {Receipt as ReceiptIcon} from 'lucide-react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {type CameraKey, type Cue, prog} from '../../lib/core';
import {FlyChip} from '../../lib/Fx';
import {Lucide} from '../../lib/lucide';
import {E, Tap, hitPulse, pressScale, punch, usePhoneIn} from '../../lib/motion';
import {C, body} from '../../lib/palette';
import {STAGE_SCREEN_H as SH, STAGE_ZOOM as Z, StagePhone, onStage} from '../../lib/Phone';
import {Button, PANEL, PageHeader} from '../../lib/ui';
import {BLUE, OS_BG, StepChip} from '../parts';
import {cue} from '../voice';

// VO: "Lalu ketuk Get the Shortcut," | "tambahkan ke iPhone-mu," | "dan tempel token-mu saat diminta."
const GET_AT = cue('S4', 0, 0.65);
const SHEET_AT = GET_AT + 12; // the shared Shortcut opens
const SETUP_AT = cue('S4', 1, 0.6); // "Siapkan Pintasan"
const PAGE_AT = SETUP_AT + 6;
const PASTE_AT = cue('S4', 2, 0.35); // the token, pasted
const PASTE_DUR = 24;
const ADD_AT = cue('S4', 2, 0.9); // "Tambah Pintasan"
const DONE_AT = ADD_AT + 10;

const T = 92; // the quick add card's top, scrolled as S3 left it (app px)
const GET_BTN = {x: 32 + 91, y: T + 284, w: 182, h: 44};
const SHEET_H = 400;
const SETUP_BTN = {x: 197, y: SH - 8 - 34 - 25, w: 330, h: 50};
const FIELD = {x: 197, y: 238, w: 330, h: 46};
const ADD_BTN = {x: 197, y: SH - 60, w: 362, h: 50};
const SHORTCUT_TILE = 'oklch(0.86 0.17 92)'; // the shared Shortcut's own tile colour (yellow)
const s = (p: {x: number; y: number}) => onStage(p.x, p.y);

export const camera: CameraKey[] = [
  {at: 0, zoom: 1.4, x: 540, y: s({x: 0, y: T + 250}).y, dur: 1},
  // "Get the Shortcut": hard cut in on the button as it is pressed, then wide for the sheet.
  ...punch(GET_AT - 2, s(GET_BTN).x, s(GET_BTN).y, {zoom: 1.2, x: 540, y: s({x: 0, y: SH - SHEET_H / 2}).y}, 2.2, 22),
  {at: PAGE_AT, zoom: 1.4, x: 540, y: s(FIELD).y},
];

export const sfx: Cue[] = [
  {at: GET_AT, sound: 'tap', volume: 0.8},
  {at: SHEET_AT, sound: 'whoosh', volume: 0.35},
  {at: SETUP_AT, sound: 'tap', volume: 0.7},
  {at: PAGE_AT, sound: 'whoosh', volume: 0.2},
  {at: PASTE_AT, sound: 'whoosh', volume: 0.25},
  {at: PASTE_AT + PASTE_DUR - 4, sound: 'click', volume: 0.6},
  {at: ADD_AT, sound: 'tap', volume: 0.8},
  {at: DONE_AT, sound: 'ding', volume: 0.5},
];

export const Scene = () => {
  const f = useCurrentFrame();
  const phoneIn = usePhoneIn();
  const sheet = prog(f, SHEET_AT, 40, E.glide);
  const page = prog(f, PAGE_AT, 26, E.glide);
  const pasted = f >= PASTE_AT + PASTE_DUR;
  const done = prog(f, DONE_AT, 22, E.out);
  return (
    <AbsoluteFill>
      <StepChip f={f} at={0} n={2} label="Shortcut" />
      <StagePhone screen={C.surface} style={phoneIn}>
        {/* The quick add card again, now with the token listed and the button to the shared Shortcut. */}
        <div style={{position: 'absolute', inset: 0, fontFamily: body, color: C.ink, transform: 'translateY(-132px)'}}>
          <div style={{padding: '48px 16px 16px', display: 'grid', gap: 16}}>
            <PageHeader title="Settings" />
            <div style={{...PANEL, height: 112}} />
            <div style={{...PANEL, padding: 16, display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: 12}}>
              <div>
                <div style={{fontSize: 15, fontWeight: 700}}>iPhone quick add</div>
                <div style={{marginTop: 4, fontSize: 13, lineHeight: 1.35, color: C.inkSoft}}>Log a payment from a bank screenshot with an iOS Shortcut. An any-account token learns which account each bank&apos;s receipt belongs to; a single-account token always adds to its one account.</div>
              </div>
              <div style={{display: 'grid', gap: 6}}>
                <div style={{fontSize: 14, fontWeight: 600}}>Account</div>
                <div style={{display: 'flex', alignItems: 'center', height: 44, padding: '0 12px', borderRadius: 14, border: `1px solid ${C.lineStrong}`, fontSize: 15, color: C.inkFaint}}>Choose an account</div>
              </div>
              <div style={{display: 'flex', flexWrap: 'wrap', gap: 12}}>
                <Button variant="primary" icon="smartphone" style={{opacity: 0.5}}>
                  Create token
                </Button>
                <Button variant="primary" icon="download" style={{transform: `scale(${pressScale(f, GET_AT)})`, outline: hitPulse(f, GET_AT - 30, 3, 20) > 0.02 ? `2px solid oklch(0.67 0.165 160 / ${hitPulse(f, GET_AT - 30, 3, 20).toFixed(3)})` : undefined, outlineOffset: 3}}>
                  Get the Shortcut
                </Button>
              </div>
              <div style={{display: 'flex', alignItems: 'center', gap: 12, paddingTop: 12, borderTop: `1px solid ${C.line}`}}>
                <span style={{display: 'grid', placeItems: 'center', width: 44, height: 44, borderRadius: 16, background: C.accentSoft}}>
                  <Lucide name="smartphone" size={20} color={C.accentStrong} />
                </span>
                <div style={{flex: 1}}>
                  <div style={{fontSize: 14, fontWeight: 700}}>Any account</div>
                  <div style={{fontSize: 12, color: C.inkSoft}}>Never used</div>
                </div>
                <Lucide name="trash" size={16} color={C.inkSoft} />
              </div>
            </div>
          </div>
        </div>
        {/* The shared Shortcut, opened from its link. */}
        <div style={{position: 'absolute', inset: 0, background: `oklch(0 0 0 / ${(0.4 * sheet).toFixed(3)})`}} />
        <div style={{position: 'absolute', left: 8, right: 8, bottom: 8, height: SHEET_H, borderRadius: 30, background: OS_BG, fontFamily: body, color: C.ink, display: 'grid', justifyItems: 'center', alignContent: 'start', padding: '34px 16px 0', boxSizing: 'border-box', transform: `translateY(${(1 - sheet) * 110}%)`}}>
          <span style={{display: 'grid', placeItems: 'center', width: 84, height: 84, borderRadius: 22, background: SHORTCUT_TILE}}>
            <ReceiptIcon size={42} color="#fff" strokeWidth={2.2} />
          </span>
          <div style={{marginTop: 14, fontSize: 24, fontWeight: 800}}>Arus Finances</div>
          <div style={{marginTop: 2, fontSize: 14, color: C.inkFaint}}>Pintasan · 26 tindakan</div>
          <div style={{marginTop: 18, fontSize: 15, lineHeight: 1.4, color: C.inkSoft, textAlign: 'center', padding: '0 12px'}}>Pintasan ini akan menanyakan satu hal saat disiapkan.</div>
          <div style={{position: 'absolute', left: 16, right: 16, bottom: 34, height: 50, borderRadius: 14, background: BLUE, color: '#fff', display: 'grid', placeItems: 'center', fontSize: 17, fontWeight: 700, transform: `scale(${pressScale(f, SETUP_AT)})`}}>Siapkan Pintasan</div>
        </div>
        {/* Set up: the one question, the token pasted in. */}
        {f >= PAGE_AT && (
          <div style={{position: 'absolute', inset: 0, background: OS_BG, fontFamily: body, color: C.ink, transform: `translateX(${(1 - page) * 394}px)`}}>
            <div style={{position: 'absolute', left: 16, right: 16, top: 56, display: 'flex', justifyContent: 'space-between', fontSize: 16}}>
              <span style={{color: BLUE}}>Batal</span>
              <span style={{fontWeight: 700}}>Siapkan Pintasan Ini</span>
              <span style={{width: 40}} />
            </div>
            <div style={{position: 'absolute', left: 16, right: 16, top: 150, borderRadius: 16, background: '#fff', padding: 16, display: 'grid', gap: 10}}>
              <div style={{fontSize: 15, fontWeight: 700}}>Add your own p_token value here</div>
              <div style={{display: 'flex', alignItems: 'center', height: FIELD.h, padding: '0 12px', borderRadius: 12, background: OS_BG, fontFamily: 'ui-monospace, Menlo, monospace', fontSize: 15, color: pasted ? C.ink : C.inkFaint, outline: pasted ? `2px solid oklch(0.67 0.165 160 / ${hitPulse(f, PASTE_AT + PASTE_DUR, 3, 14).toFixed(3)})` : undefined}}>
                {pasted ? '9f3c1a••••••••••••••••' : 'YOUR_P_TOKEN'}
              </div>
            </div>
            <div style={{position: 'absolute', left: 16, right: 16, bottom: 36, height: 50, borderRadius: 14, background: BLUE, color: '#fff', display: 'grid', placeItems: 'center', fontSize: 17, fontWeight: 700, opacity: pasted ? 1 : 0.45, transform: `scale(${pressScale(f, ADD_AT)})`}}>Tambah Pintasan</div>
            {f >= DONE_AT && (
              <div style={{position: 'absolute', left: 0, right: 0, top: 330, display: 'flex', justifyContent: 'center', opacity: prog(f, DONE_AT, 10, E.smooth), transform: `translateY(${(1 - done) * 20}px)`}}>
                <span style={{display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 18px', borderRadius: 999, background: C.accentStrong, color: '#fff', fontSize: 16, fontWeight: 800}}>
                  <Lucide name="check" size={18} color="#fff" strokeWidth={3} />
                  Ditambahkan ke Pintasan
                </span>
              </div>
            )}
          </div>
        )}
      </StagePhone>
      <Tap f={f} at={GET_AT} x={s(GET_BTN).x} y={s(GET_BTN).y} w={GET_BTN.w * Z} h={GET_BTN.h * Z} />
      <Tap f={f} at={SETUP_AT} x={s(SETUP_BTN).x} y={s(SETUP_BTN).y} w={SETUP_BTN.w * Z} h={SETUP_BTN.h * Z} r={14 * Z} />
      <Tap f={f} at={ADD_AT} x={s(ADD_BTN).x} y={s(ADD_BTN).y} w={ADD_BTN.w * Z} h={ADD_BTN.h * Z} r={14 * Z} />
      <FlyChip f={f} at={PASTE_AT} dur={PASTE_DUR} from={{x: 540, y: 170}} to={s(FIELD)} text="token" color={C.accentStrong} />
    </AbsoluteFill>
  );
};
