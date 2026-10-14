// Video 2 (arus-fitur): scene timeline from TREATMENT.md. Every frame is a function of the frame number.
import type {ComponentType, ReactNode} from 'react';
import {AbsoluteFill, Audio, Sequence, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {Backdrop} from '../lib/Backdrop';
import {type CameraKey, type Cue, cameraAt, lerp, prog, sec} from '../lib/core';
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

type Scene = {id: string; title: string; mod: {Scene: ComponentType; sfx: Cue[]; camera?: CameraKey[]}};

const SCENES: Scene[] = [
  {id: 'S1', title: 'Hook', mod: S01},
  {id: 'S2', title: 'Akun', mod: S02},
  {id: 'S3', title: 'Kategori', mod: S03},
  {id: 'S4', title: 'Anggaran', mod: S04},
  {id: 'S5', title: 'Workspace', mod: S05},
  {id: 'S6', title: 'Foto profil', mod: S06},
  {id: 'S7', title: 'Logo + CTA', mod: S07},
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

// Every scene: a slow push-in across its whole length, a soft enter and a quicker exit at the cuts,
// and inside that the scene's own camera: zooms into what the voice is talking about, and back out.
const ENTER = 10;
const EXIT = 8;
const SceneShell = ({dur, last, camera, children}: {dur: number; last: boolean; camera?: CameraKey[]; children: ReactNode}) => {
  const f = useCurrentFrame();
  const enter = prog(f, 0, ENTER);
  const exit = last ? 0 : prog(f, dur - EXIT, EXIT);
  const push = interpolate(f, [0, dur], [1, 1.035]);
  const blur = (1 - enter) * 10 + exit * 6;
  const cam = cameraAt(camera, f);
  return (
    <AbsoluteFill
      style={{
        opacity: enter * (1 - 0.75 * exit),
        transform: `scale(${push * lerp(1.06, 1, enter) * lerp(1, 0.97, exit)})`,
        filter: blur > 0.05 ? `blur(${blur}px)` : undefined,
      }}
    >
      <AbsoluteFill style={{transformOrigin: `${cam.x}px ${cam.y}px`, transform: `scale(${cam.zoom})`}}>{children}</AbsoluteFill>
    </AbsoluteFill>
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
    {TIMED.map(({id, title, from, dur, mod}, i) => (
      <Sequence key={id} name={`${id} · ${title}`} from={from} durationInFrames={dur}>
        <SceneShell dur={dur} last={i === TIMED.length - 1} camera={mod.camera}>
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
    {TIMED.slice(1).map(({id, from}) => (
      <Sequence key={`sweep-${id}`} name={`→ ${id}`} from={from - Math.round(SWEEP / 2)} durationInFrames={SWEEP}>
        <WaveSweep />
      </Sequence>
    ))}
  </AbsoluteFill>
);
