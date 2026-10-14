// S7 — It learns: the next receipt from the same screen and payee books straight away, no list. The same
// screenshot sent twice comes back "Already saved"; Arus's Recent activity has it once.
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {type CameraKey, type Cue, lerp, prog} from '../../lib/core';
import {Marker, ScanBeam, YELLOW_MARK} from '../../lib/Fx';
import {Lucide, Tile} from '../../lib/lucide';
import {E, hitPulse, usePhoneIn} from '../../lib/motion';
import {C, body} from '../../lib/palette';
import {STAGE, StagePhone, onStage} from '../../lib/Phone';
import {PANEL} from '../../lib/ui';
import {KnockTag, Notification, RECEIPT_TEXT, Receipt, knock} from '../parts';
import {cue} from '../voice';

// VO: "Berikutnya, struk dari layar yang sama LANGSUNG tercatat, tanpa ditanya." | "Kirim struk yang sama dua kali?"
//     | "Tetap tercatat SEKALI."
const KNOCKS1 = [cue('S7', 0, 0.12), cue('S7', 0, 0.2)];
const NOTIF1 = cue('S7', 0, 0.42);
const NOASK_AT = cue('S7', 0, 0.7); // "tanpa ditanya"
const GHOST_AT = cue('S7', 1, 0.15); // the same screenshot again
const KNOCKS2 = [cue('S7', 1, 0.4), cue('S7', 1, 0.5)];
const NOTIF2 = cue('S7', 2, 0.05);
const SAVED_AT = cue('S7', 2, 0.3);
const PANEL_AT = cue('S7', 2, 0.35);

export const camera: CameraKey[] = [
  {at: 0, zoom: 1.25, x: 540, y: onStage(0, 260).y, dur: 1},
  {at: PANEL_AT - 6, zoom: 1, x: 540, y: 960},
];

export const sfx: Cue[] = [
  ...[...KNOCKS1, ...KNOCKS2].map((at) => ({at, sound: 'thud', volume: 0.55})),
  {at: NOTIF1, sound: 'ding', volume: 0.6},
  {at: NOASK_AT, sound: 'click', volume: 0.5},
  {at: GHOST_AT, sound: 'whoosh', volume: 0.25},
  {at: NOTIF2, sound: 'ding', volume: 0.35},
  {at: PANEL_AT + 20, sound: 'snap', volume: 0.6},
];

export const Scene = () => {
  const f = useCurrentFrame();
  const phoneIn = usePhoneIn();
  const ghost = prog(f, GHOST_AT, 26, E.out);
  const step = prog(f, PANEL_AT, 34, E.glide);
  const panelIn = prog(f, PANEL_AT + 6, 28, E.out);
  const all = [...KNOCKS1, ...KNOCKS2];
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', inset: 0, transformOrigin: `${STAGE.left}px 960px`, transform: `translateX(${-230 * step}px) scale(${lerp(1, 0.78, step)})`}}>
        {/* The same screenshot, sent a second time: a copy slides in behind the phone. */}
        {f >= GHOST_AT && <div style={{position: 'absolute', left: STAGE.left, top: STAGE.top, width: STAGE.w, height: STAGE.h, borderRadius: 96, background: 'oklch(1 0 0 / 0.25)', border: '3px solid oklch(1 0 0 / 0.5)', transform: `translate(${ghost * 46}px, ${ghost * -36}px)`, opacity: ghost}} />}
        <StagePhone screen="#fff" style={{...phoneIn, translate: `${knock(f, all)}px 0`}}>
          <Receipt amount="Rp 48.000" payee="KEDAI KOPI" time="9 Okt 2026, 08:12" refNo="2026100908124" />
          <ScanBeam f={f} at={KNOCKS1[1] + 8} dur={30} top={RECEIPT_TEXT.top} height={RECEIPT_TEXT.height} />
          <ScanBeam f={f} at={KNOCKS2[1] + 8} dur={30} top={RECEIPT_TEXT.top} height={RECEIPT_TEXT.height} />
          {f < NOTIF2 && <Notification f={f} at={NOTIF1}>Spent Rp 48.000 · KEDAI KOPI · Makan · BCA</Notification>}
          <Notification f={f} at={NOTIF2}>
            <Marker at={SAVED_AT} f={f} color={YELLOW_MARK}>
              Already saved
            </Marker>{' '}
            · Spent Rp 48.000 · KEDAI KOPI · Makan · BCA
          </Notification>
          {f >= NOASK_AT && f < NOTIF2 && (
            <div style={{position: 'absolute', right: 14, top: 132, display: 'flex', opacity: prog(f, NOASK_AT, 10, E.smooth), transform: `translateY(${(1 - prog(f, NOASK_AT, 20, E.out)) * 10}px)`}}>
              <span style={{padding: '6px 14px', borderRadius: 999, background: C.accentStrong, color: '#fff', fontFamily: body, fontSize: 15, fontWeight: 800}}>tanpa ditanya</span>
            </div>
          )}
        </StagePhone>
      </div>
      <KnockTag f={f} ats={f < KNOCKS2[0] ? KNOCKS1 : KNOCKS2} x={STAGE.left + STAGE.w - 120} y={onStage(0, 520).y} />
      {/* Arus's Recent activity: the 48.000 is there once. */}
      {f >= PANEL_AT && (
        <div style={{position: 'absolute', left: 520, top: 820, width: 540, ...PANEL, borderRadius: 30, padding: '24px 22px', fontFamily: body, opacity: prog(f, PANEL_AT + 6, 10, E.smooth), transform: `translateY(${(1 - panelIn) * 50}px)`}}>
          <div style={{fontSize: 30, fontWeight: 800, color: C.ink, marginBottom: 10}}>Recent activity</div>
          {[
            {amount: 'Rp 48.000', date: '9 Okt', once: true},
            {amount: 'Rp 152.500', date: '7 Okt', once: false},
          ].map((r) => (
            <div key={r.amount} style={{display: 'flex', alignItems: 'center', gap: 14, padding: '14px 0', borderTop: `1px solid ${C.line}`}}>
              <Tile icon="utensils" tone="tangerine" size="md" />
              <div style={{flex: 1, minWidth: 0}}>
                <div style={{fontSize: 24, fontWeight: 700, color: C.ink}}>KEDAI KOPI</div>
                <div style={{fontSize: 20, color: C.inkSoft}}>{r.date} · Makan</div>
              </div>
              <div style={{fontSize: 24, fontWeight: 800, color: C.expense, whiteSpace: 'nowrap'}}>−{r.amount}</div>
              {r.once && (
                <span style={{display: 'inline-flex', alignItems: 'center', gap: 4, padding: '4px 10px', borderRadius: 999, background: C.accentSoft, color: C.accentInk, fontSize: 20, fontWeight: 800, transform: `scale(${prog(f, PANEL_AT + 20, 16, E.out) * (1 + 0.15 * hitPulse(f, PANEL_AT + 24))})`}}>
                  <Lucide name="check" size={16} color={C.accentInk} strokeWidth={3} />1×
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </AbsoluteFill>
  );
};
