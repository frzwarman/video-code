// S7 — Closing: logo draws its wave, wordmark, tagline, link. Last 1.5s silent hold.
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {type CameraKey, type Cue, back, fadeUp, prog, spin} from '../../lib/core';
import {cue, voiceEnd} from '../voice';
import {Marker, Ring} from '../../lib/Fx';
import {WAVE} from '../../lib/Logo';
import {Logo3D} from '../../lib/Logo3D';
import {C, body, display} from '../../lib/palette';

const WAVE_AT = 6;
const LINK_AT = voiceEnd('S7') + 6;
const PULSES = [LINK_AT + 40, LINK_AT + 100];
// Tight on the logo as it draws, then pull back for the wordmark.
export const camera: CameraKey[] = [{at: 0, zoom: 1.6, x: 540, y: 630, dur: 1}, {at: cue('S7', 0) - 10, zoom: 1, dur: 40}];

export const sfx: Cue[] = [{at: WAVE_AT + 24, sound: 'chime', volume: 0.7}];

export const Scene = () => {
  const f = useCurrentFrame();
  const tile = prog(f, 0, 30, back);
  const linkIn = prog(f, LINK_AT, 24);
  const pulse = PULSES.reduce((s, at) => s + (f >= at ? Math.exp(-(f - at) / 7) : 0), 0);
  return (
    <AbsoluteFill style={{alignItems: 'center'}}>
      {/* The logo's own wave, drawn large across the frame behind the tile: arus = flow. */}
      <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{position: 'absolute', inset: 0}}>
        <path d={WAVE} transform="translate(-260 -170) scale(50)" stroke={C.highlight} strokeWidth={0.3} strokeLinecap="round" fill="none" opacity={0.4} pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - prog(f, WAVE_AT + 20, 56)} />
      </svg>
      <div style={{position: 'absolute', top: 480, opacity: prog(f, 0, 12), transform: `scale(${0.6 + 0.4 * tile})`}}>
        <Logo3D size={300} draw={prog(f, WAVE_AT, 36)} turn={spin(f, 0, 30, -120)} />
      </div>
      <div style={{position: 'absolute', top: 850, fontFamily: display, fontSize: 132, fontWeight: 800, letterSpacing: -3, color: C.onBand}}>
        {'Arus'.split('').map((ch, i) => (
          <span key={i} style={{display: 'inline-block', ...fadeUp(prog(f, cue('S7', 0) - 6 + i * 4, 20), 30)}}>
            {ch}
          </span>
        ))}
      </div>
      {PULSES.map((at) => (
        <Ring key={at} f={f} at={at} x={540} y={1365} r0={120} r1={300} dur={30} width={4} />
      ))}
      <div style={{position: 'absolute', top: 1040, fontFamily: body, fontWeight: 600, fontSize: 52, color: C.onBandSoft, ...fadeUp(prog(f, cue('S7', 1), 24), 24)}}>
        Lihat ke mana uangmu <Marker at={cue('S7', 1) + 30} f={f}>mengalir.</Marker>
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
