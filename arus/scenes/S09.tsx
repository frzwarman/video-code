// S9 · 41.73–43.45s — "Soal keamanan:" title card.
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {type CameraKey, type Cue, fadeUp, prog} from '../../lib/core';
import {cue} from '../voice';
import {Lock} from '../../lib/icons';
import {Marker, Ring} from '../../lib/Fx';
import {C, display} from '../../lib/palette';

const SHUT_AT = cue('S9', 0, 0.9);
export const camera: CameraKey[] = [{at: SHUT_AT - 20, zoom: 1.1, x: 540, y: 900, dur: 30}];

export const sfx: Cue[] = [{at: 0, sound: 'tone', volume: 0.7}, {at: SHUT_AT, sound: 'click', volume: 0.7}];

export const Scene = () => {
  const f = useCurrentFrame();
  const inP = prog(f, 0, 20);
  const titleP = prog(f, 6, 22);
  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', gap: 48}}>
      <Ring f={f} at={SHUT_AT} x={540} y={880} r0={70} r1={260} dur={28} />
      <div style={{opacity: inP, transform: `translateY(${(1 - inP) * 30}px) scale(${1 + (f >= SHUT_AT ? 0.12 * Math.exp(-(f - SHUT_AT) / 6) : 0)})`}}>
        <Lock size={160} color={C.highlight} open={1 - prog(f, SHUT_AT - 14, 14)} />
      </div>
      <div style={{fontFamily: display, fontSize: 96, fontWeight: 800, color: C.onBand, ...fadeUp(titleP, 40), filter: titleP < 1 ? `blur(${(1 - titleP) * 8}px)` : undefined}}>
        Soal <Marker at={SHUT_AT + 4} f={f}>keamanan:</Marker>
      </div>
    </AbsoluteFill>
  );
};
