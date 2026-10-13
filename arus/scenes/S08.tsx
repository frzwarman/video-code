// S8 · 37.63–41.73s — Shared with the household: three people, three phones, one number.
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {type CameraKey, type Cue, back, cue, fadeUp, prog, roundK, rupiah} from '../core';
import {Phone} from '../Phone';
import {Ring} from '../Fx';
import {C, body, display} from '../palette';

const TOTAL = 947_000; // the S4 accounts added up
const COUNT = {from: cue('S8', 1), to: cue('S8', 1, 0.8)}; // VO: "Semua melihat angka yang sama."
const LINK_AT = cue('S8', 1, 0.85);
const PEOPLE = [
  {role: 'Pemilik', initial: 'A', tint: C.accent},
  {role: 'Editor', initial: 'R', tint: C.transfer},
  {role: 'Pembaca', initial: 'D', tint: C.warn},
];
const xs = [60, 400, 740];
const NUM_Y = 640 + 14 + 250; // phone top + bezel + number offset

// In on the three numbers while they settle, out after the line.
export const camera: CameraKey[] = [{at: COUNT.from, zoom: 1.18, x: 540, y: 904, dur: 36}, {at: LINK_AT + 40, zoom: 1, dur: 30}];

export const sfx: Cue[] = [
  ...PEOPLE.map((_, i) => ({at: 10 + i * 12, sound: 'click', volume: 0.4})),
  {at: LINK_AT, sound: 'snap', volume: 0.6},
];

export const Scene = () => {
  const f = useCurrentFrame();
  const n = interpolate(f, [COUNT.from, COUNT.to], [0, TOTAL], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const link = prog(f, LINK_AT, 30);

  return (
    <AbsoluteFill>
      {PEOPLE.map((p, i) => {
        const inP = prog(f, 10 + i * 12, 24, back);
        return (
          <div key={p.role}>
            <div style={{position: 'absolute', left: xs[i], width: 280, top: 300, textAlign: 'center', ...fadeUp(inP, 30)}}>
              <div
                style={{
                  width: 120,
                  height: 120,
                  margin: '0 auto',
                  borderRadius: '50%',
                  background: p.tint,
                  display: 'grid',
                  placeItems: 'center',
                  fontFamily: display,
                  fontWeight: 700,
                  fontSize: 56,
                  color: C.surface,
                }}
              >
                {p.initial}
              </div>
              <div style={{fontFamily: body, fontWeight: 800, fontSize: 38, color: C.ink, marginTop: 20}}>{p.role}</div>
            </div>
            <Phone w={280} h={600} screen={C.surface} style={{left: xs[i], top: 640, borderRadius: 56, ...fadeUp(inP, 60)}}>
              <div style={{position: 'absolute', top: 120, width: '100%', textAlign: 'center', fontFamily: body}}>
                <div style={{fontWeight: 600, fontSize: 22, letterSpacing: 3, color: C.inkFaint}}>SALDO TOTAL</div>
                <div style={{fontWeight: 800, fontSize: 40, color: C.ink, marginTop: 92, fontVariantNumeric: 'tabular-nums'}}>{rupiah(roundK(n))}</div>
              </div>
              {[0, 1, 2].map((r) => (
                <div key={r} style={{position: 'absolute', left: 24, right: 24, top: 360 + r * 60, height: 36, borderRadius: 12, background: C.raised, ...fadeUp(prog(f, 34 + i * 12 + r * 6, 16), 24)}} />
              ))}
              {/* Synced: a check on every phone once the number settles. */}
              <div style={{position: 'absolute', right: 20, top: 66, width: 56, height: 56, borderRadius: 18, background: C.income, display: 'grid', placeItems: 'center', opacity: prog(f, COUNT.to + i * 6, 8), transform: `scale(${0.6 + 0.4 * prog(f, COUNT.to + i * 6, 16, back)})`}}>
                <svg width={34} height={34} viewBox="0 0 24 24">
                  <path d="M5 12.5l4.5 4.5L19 7.5" stroke={C.surface} strokeWidth={3.2} strokeLinecap="round" strokeLinejoin="round" fill="none" />
                </svg>
              </div>
            </Phone>
            <Ring f={f} at={LINK_AT + Math.round((30 * (xs[i] + 140 - 60)) / 960)} x={xs[i] + 140} y={NUM_Y} r0={30} r1={150} dur={26} />
          </div>
        );
      })}
      {/* One line through all three numbers: the same figure everywhere. */}
      <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
        {link > 0 && (
          <path d={`M60 ${NUM_Y} H1020`} stroke={C.highlight} strokeWidth={4} pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - link} strokeOpacity={0.9} />
        )}
      </svg>
      <div style={{position: 'absolute', top: 1340, width: '100%', textAlign: 'center', fontFamily: display, fontWeight: 700, fontSize: 56, color: C.highlight, ...fadeUp(link)}}>
        Angka yang sama.
      </div>
    </AbsoluteFill>
  );
};
