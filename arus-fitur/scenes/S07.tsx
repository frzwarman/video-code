// S7 — Closing: logo draws its wave, wordmark, tagline, link. Last 1.5s silent hold.
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {type CameraKey, type Cue, prog, spin} from '../../lib/core';
import {E, Words, hitPulse} from '../../lib/motion';
import {cue, voiceEnd} from '../voice';
import {Marker} from '../../lib/Fx';
import {WAVE} from '../../lib/Logo';
import {Logo3D} from '../../lib/Logo3D';
import {C, body, display} from '../../lib/palette';

const WAVE_AT = 6;
const LINK_AT = voiceEnd('S7') + 6;
const PULSES = [LINK_AT + 40, LINK_AT + 100];
// Tight on the logo as it draws, then pull back for the wordmark; the end card then builds on its own creep.
export const camera: CameraKey[] = [{at: 0, zoom: 1.6, x: 540, y: 630, dur: 1}, {at: cue('S7', 0) - 10, zoom: 1}];

export const sfx: Cue[] = [{at: WAVE_AT + 24, sound: 'chime', volume: 0.7}];

export const Scene = () => {
  const f = useCurrentFrame();
  const tile = prog(f, 0, 30, E.out);
  const linkIn = prog(f, LINK_AT, 26, E.out);
  const pulse = PULSES.reduce((s, at) => s + hitPulse(f, at, 3, 8), 0);
  return (
    <AbsoluteFill style={{alignItems: 'center'}}>
      {/* The logo's own wave, drawn large across the frame behind the tile: arus = flow. */}
      <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{position: 'absolute', inset: 0}}>
        <path d={WAVE} transform="translate(-260 -170) scale(50)" stroke={C.highlight} strokeWidth={0.3} strokeLinecap="round" fill="none" opacity={0.4} pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - prog(f, WAVE_AT + 20, 56)} />
      </svg>
      <div style={{position: 'absolute', top: 480, opacity: prog(f, 0, 12, E.smooth), transform: `scale(${0.6 + 0.4 * tile})`}}>
        <Logo3D size={300} draw={prog(f, WAVE_AT, 36)} turn={spin(f, 0, 30, -120)} />
      </div>
      <div style={{position: 'absolute', top: 850, fontFamily: display, fontSize: 132, fontWeight: 800, letterSpacing: -3, color: C.onBand}}>
        <Words f={f} at={cue('S7', 0) - 6} words={'Arus'.split('')} gap="0" stagger={4} />
      </div>
      <div style={{position: 'absolute', top: 1040, fontFamily: body, fontWeight: 600, fontSize: 52, color: C.onBandSoft}}>
        <Words f={f} at={cue('S7', 1)} words={['Lihat', 'ke', 'mana', 'uangmu', <Marker at={cue('S7', 1) + 40} f={f}>mengalir.</Marker>]} />
      </div>
      <div
        style={{
          position: 'absolute',
          top: 1320,
          padding: '24px 44px',
          borderRadius: 999,
          background: C.accentSoft,
          fontFamily: body,
          fontWeight: 800,
          fontSize: 42,
          color: C.accentStrong,
          opacity: linkIn,
          transform: `translateY(${(1 - linkIn) * 24}px) scale(${1 + 0.06 * pulse})`,
        }}
      >
        arus-finance.farizz-a.workers.dev
      </div>
    </AbsoluteFill>
  );
};
