// The closing logo + CTA card (STYLE.md: every video ends on it).
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {prog, spin} from './core';
import {Marker} from './Fx';
import {WAVE} from './Logo';
import {Logo3D} from './Logo3D';
import {E, Words, hitPulse} from './motion';
import {C, body, display} from './palette';

const WAVE_AT = 6;
/** Its sound: a soft chime as the wave line finishes. */
export const END_SFX = [{at: WAVE_AT + 24, sound: 'chime', volume: 0.7}];

/**
 * The closing card every video ends on: the 3D logo turns in and draws its wave, the wordmark, the tagline word by
 * word, the link (pulsing twice), and an optional `hint` naming where the feature lives. Frames are scene frames:
 * `wordAt` = "Arus.", `lineAt` = the tagline, `linkAt` = when the link lands (after the voice).
 */
export const EndCard = ({wordAt, lineAt, linkAt, hint}: {wordAt: number; lineAt: number; linkAt: number; hint?: string}) => {
  const f = useCurrentFrame();
  const PULSES = [linkAt + 40, linkAt + 100];
  const tile = prog(f, 0, 30, E.out);
  const linkIn = prog(f, linkAt, 26, E.out);
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
        <Words f={f} at={wordAt - 6} words={'Arus'.split('')} gap="0" stagger={4} />
      </div>
      <div style={{position: 'absolute', top: 1040, fontFamily: body, fontWeight: 600, fontSize: 52, color: C.onBandSoft}}>
        <Words f={f} at={lineAt} words={['Lihat', 'ke', 'mana', 'uangmu', <Marker at={lineAt + 40} f={f}>mengalir.</Marker>]} />
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
      {hint && (
        <div style={{position: 'absolute', top: 1450, fontFamily: body, fontWeight: 700, fontSize: 36, color: C.onBandSoft, opacity: prog(f, linkAt + 14, 12, E.smooth), transform: `translateY(${(1 - prog(f, linkAt + 14, 26, E.out)) * 20}px)`}}>
          {hint}
        </div>
      )}
    </AbsoluteFill>
  );
};
