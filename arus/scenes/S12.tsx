// S12 · 54.13–58.07s — Encrypted in transit and at rest: a packet leaves the phone, passes through the
// first lock and comes out scrambled, then lands in the database as the second lock closes.
import {AbsoluteFill, Easing, useCurrentFrame} from 'remotion';
import {type CameraKey, type Cue, back, fadeUp, lerp, prog, spin} from '../../lib/core';
import {cue} from '../voice';
import {Marker, scramble} from '../../lib/Fx';
import {Database, Device, Lock} from '../../lib/icons';
import {C, body, display} from '../../lib/palette';

const Y = 760;
const LOCKS = [
  {x: 540, label: 'dikirim', at: cue('S12', 0, 0.75)},
  {x: 880, label: 'disimpan', at: cue('S12', 1, 0.55)},
];
const PACKET = {leave: cue('S12', 0, 0.15), through: LOCKS[0].at, arrive: LOCKS[1].at};

// Follow the packet along the line, then pull back for the caption.
export const camera: CameraKey[] = [{at: 0, zoom: 1.5, x: 300, y: 760, dur: 1}, {at: 8, zoom: 1, dur: 36}, {at: PACKET.leave, zoom: 1.3, x: 460, y: 760, dur: 30}, {at: PACKET.through, zoom: 1.3, x: 700, y: 760, dur: PACKET.arrive - PACKET.through}, {at: PACKET.arrive + 10, zoom: 1, dur: 36}];

export const sfx: Cue[] = [{at: PACKET.leave, sound: 'tick', volume: 0.4}, ...LOCKS.map((l) => ({at: l.at + 10, sound: 'click', volume: 0.8}))];

const Badge = ({x, label, at, f}: {x: number; label: string; at: number; f: number}) => {
  const inP = prog(f, at - 20, 18, back);
  return (
    <div style={{position: 'absolute', left: x - 70, top: Y + (x === 540 ? -70 : 50), width: 140, textAlign: 'center', ...fadeUp(inP, 20)}}>
      <div style={{width: 140, height: 140, borderRadius: 40, background: C.accentSoft, display: 'grid', placeItems: 'center', transform: `scale(${1 + 0.1 * (f >= at ? Math.exp(-(f - at) / 6) : 0)}) rotate(${spin(f, at - 20, 22)}deg)`}}>
        <Lock size={84} color={C.accentStrong} open={1 - prog(f, at, 12)} />
      </div>
      <div style={{fontFamily: body, fontWeight: 800, fontSize: 36, color: C.onBandSoft, marginTop: 18}}>{label}</div>
    </div>
  );
};

// Constant speed along the line: phone → lock, then lock → database.
const packetX = (f: number) =>
  f < PACKET.through
    ? lerp(330, 540, prog(f, PACKET.leave, PACKET.through - PACKET.leave, Easing.linear))
    : lerp(540, 880, prog(f, PACKET.through, PACKET.arrive - PACKET.through, Easing.linear));

export const Scene = () => {
  const f = useCurrentFrame();
  const line = prog(f, 10, 30);
  const encrypted = f >= PACKET.through;
  const packetIn = prog(f, PACKET.leave, 8);
  const packetOut = prog(f, PACKET.arrive - 6, 8);

  return (
    <AbsoluteFill>
      <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
        <path d={`M300 ${Y} H${lerp(300, 780, line)}`} stroke={C.highlight} strokeWidth={8} strokeLinecap="round" opacity={line > 0 ? 1 : 0} />
      </svg>
      <div style={{position: 'absolute', left: 120, top: Y - 110, ...fadeUp(prog(f, 0, 20))}}>
        <Device size={220} color={C.onBand} />
      </div>
      <div style={{position: 'absolute', left: 770, top: Y - 110, opacity: prog(f, 6, 20), transform: `translateY(${(1 - prog(f, 6, 20)) * 30}px) scale(${1 + 0.06 * (f >= PACKET.arrive ? Math.exp(-(f - PACKET.arrive) / 6) : 0)})`}}>
        <Database size={220} color={C.onBand} />
      </div>
      {f >= PACKET.leave && (
        <div
          style={{
            position: 'absolute',
            left: packetX(f),
            top: Y - 34,
            transform: `translateX(-50%) scale(${lerp(0.9, 1, packetIn) * (1 - 0.4 * packetOut)})`,
            opacity: packetIn * (1 - packetOut),
            padding: '10px 24px',
            borderRadius: 999,
            background: encrypted ? C.accentSoft : C.ink,
            color: encrypted ? C.accentStrong : C.onAccent,
            fontFamily: 'ui-monospace, SF Mono, Menlo, monospace',
            fontWeight: 700,
            fontSize: 34,
            whiteSpace: 'nowrap',
          }}
        >
          {encrypted ? scramble('Rp 152.500', 1, f, 's12') : 'Rp 152.500'}
        </div>
      )}
      {LOCKS.map((l) => (
        <Badge key={l.label} {...l} f={f} />
      ))}
      <div style={{position: 'absolute', top: 1140, left: 90, right: 90, textAlign: 'center', fontFamily: display, fontSize: 66, lineHeight: 1.25, fontWeight: 800, color: C.onBand, ...fadeUp(prog(f, PACKET.arrive + 30, 24))}}>
        Terenkripsi saat <Marker at={PACKET.arrive + 46} f={f}>dikirim</Marker> & <Marker at={PACKET.arrive + 58} f={f}>disimpan</Marker>
      </div>
    </AbsoluteFill>
  );
};
