// The film shell every video shares: scenes laid end to end on their voice clips, each in a camera shell with
// a 'through' or 'relay' entrance, effects under the voice, the wave sweep on the through cuts.
import type {ComponentType, ReactNode} from 'react';
import {AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame} from 'remotion';
import {Backdrop} from './Backdrop';
import {type CameraKey, type Cue, type Voice, lerp, prog, sec} from './core';
import {WAVE} from './Logo';
import {E, type Enter, EnterContext, lmix, shotAt} from './motion';
import {C} from './palette';

export type SceneDef = {id: string; title: string; enter: Enter; mod: {Scene: ComponentType; sfx: Cue[]; camera?: CameraKey[]}};
type Timed = SceneDef & {from: number; dur: number};

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

const FilmOf = ({timed, voice}: {timed: Timed[]; voice: Record<string, Voice>}) => (
  <AbsoluteFill>
    <Backdrop cuts={timed.slice(1).map((s) => s.from)} sweep={SWEEP} />
    {timed.map(({id, title, from, dur, enter, mod}, i) => (
      <Sequence key={id} name={`${id} · ${title}`} from={from} durationInFrames={dur}>
        <SceneShell dur={dur} enter={enter} leave={timed[i + 1]?.enter} camera={mod.camera} from={i > 0 ? shotAt(timed[i - 1].mod.camera, timed[i - 1].dur - 1) : undefined}>
          <mod.Scene />
        </SceneShell>
        <Sequence from={sec(voice[id].lead)} layout="none" name="voice">
          <Audio src={staticFile(voice[id].file)} />
        </Sequence>
        {mod.sfx.map((c, i) => (
          <Sequence key={i} from={c.at} durationInFrames={sec(2)} layout="none">
            <Audio src={staticFile(`sfx/${c.sound}.wav`)} volume={(c.volume ?? 1) * SFX_GAIN} />
          </Sequence>
        ))}
      </Sequence>
    ))}
    {timed.filter((s) => s.enter === 'through').map(({id, from}) => (
      <Sequence key={`sweep-${id}`} name={`→ ${id}`} from={from - Math.round(SWEEP / 2)} durationInFrames={SWEEP}>
        <WaveSweep />
      </Sequence>
    ))}
  </AbsoluteFill>
);

/**
 * A video from its scene list and voice manifest. Each scene lasts lead + its voice clip + tail.
 * 'through': a scale-through cut (the outgoing shot rushes in, the new one lands from 1.7×), with the wave sweep,
 * where the picture really changes. 'relay': the phone stays put and only its screen changes, the camera carrying
 * on from the last scene's final shot: one continuous take.
 */
export const makeFilm = (scenes: SceneDef[], voice: Record<string, Voice>) => {
  const timed = scenes.reduce<Timed[]>((acc, s) => {
    const v = voice[s.id];
    const from = acc.length ? acc[acc.length - 1].from + acc[acc.length - 1].dur : 0;
    return [...acc, {...s, from, dur: sec(v.lead + v.seconds + v.tail)}];
  }, []);
  return {Film: () => <FilmOf timed={timed} voice={voice} />, DURATION: timed[timed.length - 1].from + timed[timed.length - 1].dur};
};
