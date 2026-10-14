// S2 — What it is: the receipt is read into text on the phone; only that text goes to Arus. The image tries to
// follow and stops at the phone's edge (locked); Arus has no line to the bank, struck through.
import {Landmark, Lock} from 'lucide-react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {type CameraKey, type Cue, lerp, prog} from '../../lib/core';
import {FlowDots, ScanBeam} from '../../lib/Fx';
import {Logo} from '../../lib/Logo';
import {E, hitPulse} from '../../lib/motion';
import {C, body} from '../../lib/palette';
import {Receipt} from '../parts';
import {cue} from '../voice';

// VO: "Shortcut ini membaca teks dari tangkapan layar struk," | "LANGSUNG di iPhone-mu."
//     | "Gambarnya tidak pernah dikirim," | "dan Arus tidak pernah terhubung ke bank."
const NODES_AT = cue('S2', 0, 0.02);
const SCAN_AT = cue('S2', 0, 0.3);
const LINES_AT = cue('S2', 0, 0.6); // text lines peel off the receipt, 6 f apart
const OUTLINE_AT = cue('S2', 1, 0.05);
const GHOST_AT = cue('S2', 2, 0.1); // the image tries to leave…
const HIT_AT = GHOST_AT + 22; // …and stops at the phone's edge
const FLOW_AT = cue('S2', 2, 0.75); // only the text travels on
const BANK_AT = cue('S2', 3, 0.05);
const STRIKE_AT = cue('S2', 3, 0.6);

const DY = 240; // the diagram's vertical offset in the frame
const RC = {x: 90, y: 640 + DY, w: 240, h: 320}; // receipt
const TX = {x: 420, y: 640 + DY, w: 240, h: 320}; // text
const AR = {x: 800, y: 715 + DY, s: 170}; // Arus
const BOX = {x: 60, y: 560 + DY, w: 630, h: 520}; // the phone
const BANK = {x: 780, y: 1180 + DY, w: 230, h: 84};
const MID = 800 + DY; // the text → Arus line
const LINES = ['Transfer Berhasil', 'Rp 152.500', 'Ke: KEDAI KOPI', '7 Okt 2026'];

export const camera: CameraKey[] = [{at: 0, zoom: 1.05, x: 540, y: 860 + DY, dur: 1}];

export const sfx: Cue[] = [
  {at: SCAN_AT, sound: 'tone', volume: 0.25},
  ...LINES.map((_, i) => ({at: LINES_AT + i * 6 + 20, sound: 'click', volume: 0.35})),
  {at: OUTLINE_AT, sound: 'whoosh', volume: 0.25},
  {at: HIT_AT, sound: 'thud', volume: 0.6},
  {at: FLOW_AT, sound: 'tick', volume: 0.35},
  {at: STRIKE_AT, sound: 'whoosh', volume: 0.35},
];

const label = (f: number, at: number, text: string, x: number, w: number, y: number) => (
  <div style={{position: 'absolute', left: x, width: w, top: y, textAlign: 'center', fontFamily: body, fontWeight: 800, fontSize: 36, color: C.onBand, opacity: prog(f, at + 8, 12, E.smooth)}}>{text}</div>
);
const land = (f: number, at: number) => ({opacity: prog(f, at, 10, E.smooth), transform: `translateY(${(1 - prog(f, at, 26, E.out)) * 40}px)`});

export const Scene = () => {
  const f = useCurrentFrame();
  const outline = prog(f, OUTLINE_AT, 30, E.out);
  const ghost = prog(f, GHOST_AT, 22, E.exit); // accelerates into the wall
  const rebound = prog(f, HIT_AT, 18, E.out);
  const ghostX = lerp(RC.x, BOX.x + BOX.w - RC.w, ghost) - rebound * 40;
  const strike = prog(f, STRIKE_AT, 16, E.out);
  return (
    <AbsoluteFill style={{fontFamily: body}}>
      {/* The phone: everything inside happens on it. */}
      <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
        <rect x={BOX.x} y={BOX.y} width={BOX.w} height={BOX.h} rx={56} fill="none" stroke="#fff" strokeOpacity={0.85} strokeWidth={5} pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - outline} />
        {/* Text → Arus: the only thing that travels. */}
        <path d={`M${TX.x + TX.w + 14} ${MID} L${AR.x - 14} ${MID}`} stroke="#fff" strokeOpacity={0.5 * prog(f, FLOW_AT, 12, E.smooth)} strokeWidth={4} strokeLinecap="round" />
        <FlowDots d={`M${TX.x + TX.w + 14} ${MID} L${AR.x - 14} ${MID}`} f={f} from={FLOW_AT} color={C.highlight} count={3} speed={4} r={8} />
        {/* Arus ⇢ bank: no line, struck through. */}
        <path d={`M${AR.x + AR.s / 2} ${AR.y + AR.s + 16} L${BANK.x + BANK.w / 2} ${BANK.y - 12}`} stroke="#fff" strokeOpacity={0.55 * prog(f, BANK_AT + 10, 12, E.smooth) * (1 - 0.6 * strike)} strokeWidth={4} strokeDasharray="10 12" />
        <g stroke={C.expenseOnBand} strokeWidth={9} strokeLinecap="round" opacity={strike}>
          <path d={`M${AR.x + 50} ${1000 + DY} L${lerp(AR.x + 50, AR.x + 140, strike)} ${lerp(1000 + DY, 1090 + DY, strike)}`} />
          <path d={`M${AR.x + 140} ${1000 + DY} L${lerp(AR.x + 140, AR.x + 50, strike)} ${lerp(1000 + DY, 1090 + DY, strike)}`} />
        </g>
      </svg>
      <div style={{position: 'absolute', left: BOX.x + 30, top: BOX.y - 56, fontSize: 34, fontWeight: 800, color: C.highlight, opacity: prog(f, OUTLINE_AT + 10, 12, E.smooth)}}>di iPhone</div>
      {/* The receipt, read by the beam. */}
      <div style={{position: 'absolute', left: RC.x, top: RC.y, width: RC.w, height: RC.h, borderRadius: 22, overflow: 'hidden', boxShadow: '0 20px 40px -20px oklch(0 0 0 / 0.5)', ...land(f, NODES_AT)}}>
        <div style={{position: 'absolute', left: 0, top: 0, width: 394, height: 525, transformOrigin: 'top left', transform: `scale(${RC.w / 394})`}}>
          <Receipt amount="Rp 152.500" payee="KEDAI KOPI" time="7 Okt 2026, 10:31" refNo="2026100710311" />
          <ScanBeam f={f} at={SCAN_AT} dur={34} top={110} height={420} />
        </div>
      </div>
      {/* The image trying to leave the phone, stopped at its edge. */}
      {f >= GHOST_AT && f < HIT_AT + 30 && (
        <div style={{position: 'absolute', left: ghostX, top: RC.y, width: RC.w, height: RC.h, borderRadius: 22, background: '#fff', opacity: 0.5 * (1 - prog(f, HIT_AT + 10, 20, E.smooth)), outline: `4px solid ${C.expenseOnBand}`}} />
      )}
      {f >= HIT_AT && (
        <div style={{position: 'absolute', left: BOX.x + BOX.w - 36, top: RC.y + RC.h / 2 - 36, display: 'grid', placeItems: 'center', width: 72, height: 72, borderRadius: '50%', background: C.accentStrong, boxShadow: '0 10px 24px -8px oklch(0 0 0 / 0.5)', transform: `scale(${prog(f, HIT_AT, 16, E.out) * (1 + 0.2 * hitPulse(f, HIT_AT + 6))})`}}>
          <Lock size={36} color="#fff" strokeWidth={2.6} />
        </div>
      )}
      {/* The text: what the Shortcut sends. */}
      <div style={{position: 'absolute', left: TX.x, top: TX.y, width: TX.w, height: TX.h, borderRadius: 22, background: C.raised, padding: '22px 18px', boxSizing: 'border-box', display: 'grid', alignContent: 'start', gap: 14, ...land(f, NODES_AT + 6)}}>
        {LINES.map((l, i) => {
          const at = LINES_AT + i * 6;
          const p = prog(f, at, 24, E.glide);
          return (
            <div key={l} style={{fontFamily: 'ui-monospace, Menlo, monospace', fontSize: 21, fontWeight: 600, color: C.ink, whiteSpace: 'nowrap', opacity: prog(f, at, 8, E.smooth), transform: `translate(${(1 - p) * -(TX.x - RC.x)}px, ${(1 - p) * 40}px)`}}>
              {l}
            </div>
          );
        })}
      </div>
      <div style={{position: 'absolute', left: AR.x, top: AR.y, ...land(f, NODES_AT + 12), filter: `drop-shadow(0 18px 30px oklch(0 0 0 / 0.35))`, transform: `${land(f, NODES_AT + 12).transform} scale(${1 + 0.05 * hitPulse(f, FLOW_AT + 20)})`}}>
        <Logo size={AR.s} />
      </div>
      {label(f, NODES_AT, 'Struk', RC.x, RC.w, RC.y + RC.h + 20)}
      {label(f, NODES_AT + 6, 'Teks', TX.x, TX.w, TX.y + TX.h + 20)}
      {label(f, NODES_AT + 12, 'Arus', AR.x - 30, AR.s + 60, AR.y + AR.s + 20)}
      {/* The bank, apart. */}
      {f >= BANK_AT && (
        <div style={{position: 'absolute', left: BANK.x, top: BANK.y, width: BANK.w, height: BANK.h, borderRadius: 999, background: C.raised, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 14, fontSize: 36, fontWeight: 800, color: C.ink, ...land(f, BANK_AT), opacity: prog(f, BANK_AT, 10, E.smooth) * (1 - 0.45 * strike)}}>
          <Landmark size={34} color={C.inkSoft} strokeWidth={2.4} />
          Bank
        </div>
      )}
    </AbsoluteFill>
  );
};
