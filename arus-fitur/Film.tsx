// Video 2 (arus-fitur): scene timeline from TREATMENT.md. Every frame is a function of the frame number.
import type {ComponentType, ReactNode} from 'react';
import {AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame} from 'remotion';
import {Backdrop} from '../lib/Backdrop';
import {type CameraKey, type Cue, lerp, prog, sec} from '../lib/core';
import {E, type Enter, EnterContext, lmix, shotAt} from '../lib/motion';
import {VOICE} from './voice';
import {WAVE} from '../lib/Logo';
import {C} from '../lib/palette';
import * as S01 from './scenes/S01';
import * as S02 from './scenes/S02';
import * as S03 from './scenes/S03';
import * as S04 from './scenes/S04';
import * as S05 from './scenes/S05';
import * as S06 from './scenes/S06';
import * as S07 from './scenes/S07';

type Scene = {id: string; title: string; enter: Enter; mod: {Scene: ComponentType; sfx: Cue[]; camera?: CameraKey[]}};

// How each scene begins. 'through': a scale-through cut (the outgoing shot rushes in, the new one lands from
// 1.7×), used where the picture really changes, with the wave sweep. 'relay': the phone stays put and only its
// screen changes, the camera carrying on from where the last scene left it: one continuous take.
const SCENES: Scene[] = [
  {id: 'S1', title: 'Hook', enter: 'first', mod: S01},
  {id: 'S2', title: 'Akun', enter: 'through', mod: S02},
  {id: 'S3', title: 'Kategori', enter: 'relay', mod: S03},
  {id: 'S4', title: 'Anggaran', enter: 'through', mod: S04},
  {id: 'S5', title: 'Workspace', enter: 'relay', mod: S05},
  {id: 'S6', title: 'Foto profil', enter: 'relay', mod: S06},
  {id: 'S7', title: 'Logo + CTA', enter: 'through', mod: S07},
];

// Each scene lasts lead + its voice clip + tail (public/vo/manifest.json, written by `npm run tts`).
const TIMED = SCENES.reduce<(Scene & {from: number; dur: number})[]>((acc, s) => {
  const v = VOICE[s.id];
  const from = acc.length ? acc[acc.length - 1].from + acc[acc.length - 1].dur : 0;
  return [...acc, {...s, from, dur: sec(v.lead + v.seconds + v.tail)}];
}, []);

export const DURATION = TIMED[TIMED.length - 1].from + TIMED[TIMED.length - 1].dur;

// Voice is normalised to −14 LUFS by `npm run tts`; effects sit well under it so the voice leads.
const SFX_GAIN = 0.25;

// No fades and no blur at the cuts. A 'through' cut: the last 18 f rush in (×1.3, fastest on the cut frame) and
// the next scene lands from 1.7× over 36 f. A 'relay': the camera eases from the last scene's final shot into
// this scene's own over 40 f. Holds creep on their own (lib/motion.tsx), so there is no extra push-in.
const SceneShell = ({dur, enter, leave, camera, from, children}: {dur: number; enter: Enter; leave?: Enter; camera?: CameraKey[]; from?: ReturnType<typeof shotAt>; children: ReactNode}) => {
  const f = useCurrentFrame();
  const own = shotAt(camera, f);
  const cam = enter === 'relay' && from ? lmix(from, own, prog(f, 0, 40, E.cam)) : own;
  const k = (enter === 'through' ? lerp(1.7, 1, prog(f, 0, 36, E.out)) : 1) * (leave === 'through' ? lerp(1, 1.3, prog(f, dur - 18, 18, E.exit)) : 1);
  return (
    <EnterContext.Provider value={enter}>
      <AbsoluteFill style={{transformOrigin: `${cam.x}px ${cam.y}px`, transform: `scale(${cam.zoom * k})`}}>{children}</AbsoluteFill>
    </EnterContext.Provider>
  );
};

// The logo's wave line sweeps across each cut: head draws on, tail follows, cut happens underneath.
const SWEEP = 26;
const WaveSweep = () => {
  const f = useCurrentFrame();
  const head = prog(f, 0, SWEEP * 0.6);
  const tail = prog(f, SWEEP * 0.35, SWEEP * 0.65);
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920">
        <path
          d={WAVE}
          transform="translate(-484 -64) scale(64)"
          stroke={C.highlight}
          strokeWidth={0.35}
          strokeLinecap="round"
          fill="none"
          pathLength={1}
          strokeDasharray={`${Math.max(0, head - tail)} 2`}
          strokeDashoffset={-tail}
        />
      </svg>
    </AbsoluteFill>
  );
};

export const Film = () => (
  <AbsoluteFill>
    <Backdrop cuts={TIMED.slice(1).map((s) => s.from)} sweep={SWEEP} />
    {TIMED.map(({id, title, from, dur, enter, mod}, i) => (
      <Sequence key={id} name={`${id} · ${title}`} from={from} durationInFrames={dur}>
        <SceneShell dur={dur} enter={enter} leave={TIMED[i + 1]?.enter} camera={mod.camera} from={i > 0 ? shotAt(TIMED[i - 1].mod.camera, TIMED[i - 1].dur - 1) : undefined}>
          <mod.Scene />
        </SceneShell>
        <Sequence from={sec(VOICE[id].lead)} layout="none" name="voice">
          <Audio src={staticFile(VOICE[id].file)} />
        </Sequence>
        {mod.sfx.map((c, i) => (
          <Sequence key={i} from={c.at} durationInFrames={sec(2)} layout="none">
            <Audio src={staticFile(`sfx/${c.sound}.wav`)} volume={(c.volume ?? 1) * SFX_GAIN} />
          </Sequence>
        ))}
      </Sequence>
    ))}
    {TIMED.filter((s) => s.enter === 'through').map(({id, from}) => (
      <Sequence key={`sweep-${id}`} name={`→ ${id}`} from={from - Math.round(SWEEP / 2)} durationInFrames={SWEEP}>
        <WaveSweep />
      </Sequence>
    ))}
  </AbsoluteFill>
);
