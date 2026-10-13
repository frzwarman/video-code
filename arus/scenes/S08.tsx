// S8 · 37.63–41.73s — Shared with the household: three people, three phones, one number.
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {type CameraKey, type Cue, back, cue, fadeUp, lerp, prog, spin, swift} from '../core';
import {APP_W, Home} from '../Home';
import {Phone, bezel} from '../Phone';
import {Marker, Ring} from '../Fx';
import {C, body, display, panel, pop} from '../palette';

const COUNT = {from: cue('S8', 1), to: cue('S8', 1, 0.8)}; // VO: "Semua melihat angka yang sama."
const LINK_AT = cue('S8', 1, 0.6);
// Three people, three different phones: an iPhone, an Android, a graphite Android.
const PEOPLE = [
  {role: 'Pemilik', initial: 'A', tint: pop('mint').strong, variant: 'ios' as const, shell: {}},
  {role: 'Editor', initial: 'R', tint: pop('sky').strong, variant: 'android' as const, shell: {}},
  {role: 'Pembaca', initial: 'D', tint: pop('sun').strong, variant: 'android' as const, shell: {background: 'oklch(0.22 0.01 60)', border: '3px solid oklch(0.42 0.012 60)', borderRadius: 44}},
];
const xs = [60, 400, 740];
const BZ = bezel(280, 600);
const NUM_Y = 640 + BZ.inset + Math.round((173 + 30) * (BZ.screenW / APP_W)); // phone top + bezel + the balance line in the Home mock

// In on the three numbers while they settle, out after the line.
export const camera: CameraKey[] = [{at: COUNT.from, zoom: 1.12, x: 540, y: 904, dur: 36}, {at: LINK_AT + 40, zoom: 1, dur: 30}];

export const sfx: Cue[] = [
  ...PEOPLE.map((_, i) => ({at: 10 + i * 12, sound: 'click', volume: 0.4})),
  {at: LINK_AT, sound: 'snap', volume: 0.6},
];

export const Scene = () => {
  const f = useCurrentFrame();
  const link = prog(f, LINK_AT, 20);
  const dim = prog(f, LINK_AT - 6, 20);

  return (
    <AbsoluteFill>
      {PEOPLE.map((p, i) => {
        const inP = prog(f, 10 + i * 12, 24, back);
        return (
          <div key={p.role} style={{opacity: 1 - 0.7 * dim, transform: `scale(${1 - 0.04 * dim})`, transformOrigin: '540px 960px'}}>
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
                  color: C.onAccent,
                }}
              >
                {p.initial}
              </div>
              <div style={{fontFamily: body, fontWeight: 800, fontSize: 38, color: C.ink, marginTop: 20}}>{p.role}</div>
            </div>
            <Phone variant={p.variant} w={280} h={600} screen={C.surface} style={{left: xs[i], top: 640, borderRadius: 56, ...fadeUp(inP, 60), ...p.shell}}>
              {/* The same Home on every phone; the balance counts up on all three at once. */}
              <div style={{position: 'absolute', left: 0, top: 0, width: APP_W, transformOrigin: 'top left', transform: `scale(${BZ.screenW / APP_W}) translateY(30px)`}}>
                <Home f={f} countFrom={COUNT.from} />
              </div>
              {/* Synced: a check on every phone once the number settles. */}
              <div style={{position: 'absolute', right: 20, top: 66, width: 56, height: 56, borderRadius: 18, background: C.income, display: 'grid', placeItems: 'center', opacity: prog(f, COUNT.to + i * 6, 8), transform: `scale(${0.6 + 0.4 * prog(f, COUNT.to + i * 6, 16, back)}) rotate(${spin(f, COUNT.to + i * 6, 20)}deg)`}}>
                <svg width={34} height={34} viewBox="0 0 24 24">
                  <path d="M5 12.5l4.5 4.5L19 7.5" stroke={C.onAccent} strokeWidth={3.2} strokeLinecap="round" strokeLinejoin="round" fill="none" />
                </svg>
              </div>
            </Phone>
            <Ring f={f} at={LINK_AT + i * 8 + 30} x={540} y={855 + i * 130} r0={60} r1={240} dur={26} />
          </div>
        );
      })}
      {/* "Angka yang sama": the phones dim and each balance travels out to a stack in front, with a check. */}
      {PEOPLE.map((p, i) => {
        const go = prog(f, LINK_AT + i * 8, 32, swift);
        if (f < LINK_AT + i * 8) return null;
        const from = {x: xs[i] + BZ.inset + 16, y: NUM_Y - 17, w: 140, h: 38};
        const to = {x: 180, y: 800 + i * 130, w: 720, h: 110};
        const check = prog(f, LINK_AT + i * 8 + 30, 12);
        return (
          <div key={p.role} style={{...panel, position: 'absolute', left: lerp(from.x, to.x, go), top: lerp(from.y, to.y, go), width: lerp(from.w, to.w, go), height: lerp(from.h, to.h, go), borderRadius: lerp(10, 28, go), display: 'flex', alignItems: 'center', gap: 24, padding: `0 ${lerp(8, 28, go)}px`, boxSizing: 'border-box', overflow: 'hidden', fontFamily: body}}>
            <div style={{width: 64, height: 64, borderRadius: '50%', background: p.tint, display: 'grid', placeItems: 'center', fontFamily: display, fontWeight: 800, fontSize: 30, color: C.onAccent, opacity: go, flex: 'none'}}>{p.initial}</div>
            <span style={{flex: 1, fontWeight: 800, fontSize: lerp(22, 48, go), color: C.ink, fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap'}}>Rp 947.000</span>
            <div style={{width: 48, height: 48, borderRadius: '50%', background: C.income, display: 'grid', placeItems: 'center', opacity: go, flex: 'none'}}>
              <svg width={28} height={28} viewBox="0 0 24 24">
                <path d="M5 12.5l4.5 4.5L19 7.5" stroke={C.onAccent} strokeWidth={3.2} strokeLinecap="round" strokeLinejoin="round" fill="none" pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - check} />
              </svg>
            </div>
          </div>
        );
      })}
      <div style={{position: 'absolute', top: 1340, width: '100%', textAlign: 'center', fontFamily: display, fontWeight: 700, fontSize: 56, color: C.highlight, ...fadeUp(prog(f, LINK_AT + 50, 20))}}>
        Angka yang <Marker at={LINK_AT + 66} f={f}>sama.</Marker>
      </div>
    </AbsoluteFill>
  );
};
