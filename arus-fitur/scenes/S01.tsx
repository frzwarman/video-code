// S1 — Hook: one app for the five things that usually take five apps.
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {type CameraKey, type Cue, inOut, lerp, prog, spin} from '../../lib/core';
import {E, Words, hitPulse} from '../../lib/motion';
import {Marker} from '../../lib/Fx';
import {Logo3D} from '../../lib/Logo3D';
import {Lucide, type IconName} from '../../lib/lucide';
import {C, body, display, pop, type Tone} from '../../lib/palette';
import {cue, voiceEnd} from '../voice';

// VO: "SATU aplikasi." | "Lima hal yang biasanya butuh LIMA aplikasi berbeda."
const LINE_AT = cue('S1', 0);
const TILES_AT = cue('S1', 1, 0.08);
const COLLAPSE_AT = cue('S1', 1, 0.82); // "…berbeda": the five fold into one
const LOGO_AT = COLLAPSE_AT + 14;
const CAPTION_AT = voiceEnd('S1') - 4;

// Five things, five apps: a wallet, categories, budgets, people, a photo.
const APPS: {icon: IconName; tone: Tone; side: number}[] = [
  {icon: 'wallet', tone: 'ocean', side: -1},
  {icon: 'tags', tone: 'bubblegum', side: 1},
  {icon: 'target', tone: 'tangerine', side: -1},
  {icon: 'users', tone: 'sky', side: 1},
  {icon: 'image', tone: 'grape', side: -1},
];
const SIZE = 150;
const GAP = 26;
const ROW_Y = 1010;
const tileX = (i: number) => 540 + (i - 2) * (SIZE + GAP);

export const camera: CameraKey[] = [{at: COLLAPSE_AT - 10, zoom: 1.25, x: 540, y: ROW_Y}];

export const sfx: Cue[] = [
  ...APPS.map((_, i) => ({at: TILES_AT + i * 6, sound: 'click', volume: 0.4})),
  {at: COLLAPSE_AT + 10, sound: 'whoosh', volume: 0.35},
  {at: LOGO_AT, sound: 'snap', volume: 0.7},
];

export const Scene = () => {
  const f = useCurrentFrame();
  const collapse = prog(f, COLLAPSE_AT, 26, inOut);
  const logo = prog(f, LOGO_AT, 26, E.out);
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', top: 540, left: 60, right: 60, textAlign: 'center', fontFamily: display, fontWeight: 800, fontSize: 96, letterSpacing: -2, lineHeight: 1.1, color: C.onBand}}>
        <Words f={f} at={LINE_AT} words={[<Marker at={cue('S1', 0, 0.45)} f={f}>Satu</Marker>, 'aplikasi.']} />
      </div>
      {APPS.map((a, i) => {
        const at = TILES_AT + i * 6;
        if (f < at) return null;
        const inP = prog(f, at, 26, E.out);
        const tone = pop(a.tone);
        return (
          <div
            key={a.icon}
            style={{
              position: 'absolute',
              left: lerp(tileX(i), 540, collapse) - SIZE / 2,
              top: ROW_Y - SIZE / 2,
              width: SIZE,
              height: SIZE,
              borderRadius: 44,
              background: tone.soft,
              display: 'grid',
              placeItems: 'center',
              boxShadow: '0 24px 56px -32px oklch(0.3 0.06 168 / 0.5)',
              opacity: prog(f, at, 10, E.smooth) * (1 - prog(f, COLLAPSE_AT + 8, 14, E.smooth)),
              transform: `translateX(${(1 - inP) * a.side * 260}px) scale(${lerp(0.85 + 0.15 * inP, 0.3, collapse)})`,
            }}
          >
            <Lucide name={a.icon} size={72} color={tone.strong} />
          </div>
        );
      })}
      {f >= LOGO_AT && (
        <div style={{position: 'absolute', left: 540 - 110, top: ROW_Y - 110, opacity: prog(f, LOGO_AT, 10, E.smooth), transform: `scale(${(0.5 + 0.5 * logo) * (1 + 0.03 * hitPulse(f, LOGO_AT + 18, 3, 8))})`}}>
          <Logo3D size={220} turn={spin(f, LOGO_AT, 28, -200)} />
        </div>
      )}
      <div style={{position: 'absolute', top: 1240, width: '100%', textAlign: 'center', fontFamily: body, fontWeight: 700, fontSize: 48, color: C.onBandSoft}}>
        <Words f={f} at={CAPTION_AT} words={['Lima', 'hal,', 'satu', 'aplikasi.']} />
      </div>
    </AbsoluteFill>
  );
};
