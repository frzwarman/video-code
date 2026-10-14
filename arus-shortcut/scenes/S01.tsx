// S1 — Hook C: no words at first. A transfer receipt; two knocks on the back of the phone; the screen is read;
// Arus's notification lands. "TERCATAT" stamps it; then the phone settles back under "Pasang dalam 4 langkah".
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {type CameraKey, type Cue, lerp, prog} from '../../lib/core';
import {ScanBeam} from '../../lib/Fx';
import {E, Words, usePhoneIn} from '../../lib/motion';
import {C, display} from '../../lib/palette';
import {STAGE, StagePhone, onStage} from '../../lib/Phone';
import {KnockTag, Notification, RECEIPT_TEXT, Receipt, knock} from '../parts';
import {cue} from '../voice';

// Picture first (2.6 s), then VO: "Ketuk, ketuk." | "TERCATAT." | "Begini cara pasangnya."
const KNOCKS = [40, 54];
const SCAN_AT = 66;
const NOTIF_AT = 112;
const CHECK_AT = cue('S1', 1, 0.2);
const BACK_AT = cue('S1', 2) - 4; // the phone settles back for the headline
const RECEIPT_MID = onStage(197, 330);

export const camera: CameraKey[] = [
  {at: 0, zoom: 1.25, x: 540, y: RECEIPT_MID.y, dur: 1},
  {at: NOTIF_AT - 6, zoom: 1.35, x: 540, y: onStage(197, 80).y},
  {at: BACK_AT, zoom: 1, x: 540, y: 960},
];

export const sfx: Cue[] = [
  ...KNOCKS.map((at) => ({at, sound: 'thud', volume: 0.6})),
  {at: SCAN_AT, sound: 'tone', volume: 0.25},
  {at: NOTIF_AT, sound: 'ding', volume: 0.6},
  {at: CHECK_AT, sound: 'snap', volume: 0.6},
];

export const Scene = () => {
  const f = useCurrentFrame();
  const phoneIn = usePhoneIn();
  const back = prog(f, BACK_AT, 40, E.glide);
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', left: 0, right: 0, top: 330, textAlign: 'center', fontFamily: display, fontWeight: 800, fontSize: 64, letterSpacing: -1, color: C.onBand}}>
        <Words f={f} at={BACK_AT + 10} words={['Pasang', 'dalam', '4', 'langkah']} />
      </div>
      <div style={{position: 'absolute', inset: 0, transformOrigin: '540px 1500px', transform: `translateY(${back * 60}px) scale(${lerp(1, 0.86, back)})`}}>
        <StagePhone screen="#fff" style={{...phoneIn, translate: `${knock(f, KNOCKS)}px 0`}}>
          <Receipt amount="Rp 152.500" payee="KEDAI KOPI" time="7 Okt 2026, 10:31" refNo="2026100710311" />
          <ScanBeam f={f} at={SCAN_AT} dur={40} top={RECEIPT_TEXT.top} height={RECEIPT_TEXT.height} />
          <Notification f={f} at={NOTIF_AT} check={prog(f, CHECK_AT, 12, E.out)}>
            Spent Rp 152.500 · KEDAI KOPI · Makan · BCA
          </Notification>
        </StagePhone>
      </div>
      <KnockTag f={f} ats={KNOCKS} x={STAGE.left + STAGE.w - 120} y={onStage(0, 520).y} />
      {/* Four steps, one dot each, under the headline. */}
      <div style={{position: 'absolute', left: 0, right: 0, top: 428, display: 'flex', justifyContent: 'center', gap: 18}}>
        {[0, 1, 2, 3].map((i) => (
          <span key={i} style={{width: 18, height: 18, borderRadius: '50%', background: C.highlight, opacity: prog(f, BACK_AT + 30 + i * 5, 10, E.smooth), transform: `scale(${prog(f, BACK_AT + 30 + i * 5, 18, E.out)})`}} />
        ))}
      </div>
    </AbsoluteFill>
  );
};
