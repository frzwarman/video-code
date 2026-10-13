// S10 · 43.45–49.18s — Arus never connects to your bank. No bank login, no PIN, no password.
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {type CameraKey, type Cue, cue, fadeUp, kick, lerp, prog} from '../core';
import {Bank} from '../icons';
import {Logo} from '../Logo';
import {C, body, glass} from '../palette';

const CUT_AT = cue('S10', 0, 0.5);
// VO: "Tidak ada login bank, tidak ada PIN, tidak ada password."
const CHIPS = [
  {label: 'Login bank', strike: cue('S10', 1, 0.6)},
  {label: 'PIN', strike: cue('S10', 2, 0.65)},
  {label: 'Password', strike: cue('S10', 3, 0.65)},
];
const Y = 560;
const L = 360; // inner end of the bank side
const R = 720; // inner end of the Arus side

// In on the cut, out for the three chips.
export const camera: CameraKey[] = [{at: CUT_AT - 10, zoom: 1.25, x: 540, y: 560, dur: 28}, {at: CHIPS[0].strike - 30, zoom: 1, dur: 30}];

export const sfx: Cue[] = [{at: CUT_AT, sound: 'snap', volume: 0.6}, ...CHIPS.map((c) => ({at: c.strike, sound: 'thud', volume: 0.8}))];

export const Scene = () => {
  const f = useCurrentFrame();
  const line = prog(f, 10, 30);
  const cut = prog(f, CUT_AT, 24);
  // After the cut each half pulls back toward its own icon.
  const gap = 40 * (1 - cut) + 130 * cut;

  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', left: 120, top: Y - 120, width: 240, height: 240, borderRadius: 64, background: C.raised, display: 'grid', placeItems: 'center', ...fadeUp(prog(f, 0, 20)), opacity: prog(f, 0, 20) * (1 - 0.55 * cut)}}>
        <Bank size={140} color={C.inkSoft} />
      </div>
      <div style={{position: 'absolute', left: 720, top: Y - 120, ...fadeUp(prog(f, 4, 20))}}>
        <Logo size={240} />
      </div>
      <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
        {line > 0 && (
          <>
            {/* Dashes march toward the middle (a connection being attempted) and freeze at the cut. */}
            <path d={`M${L} ${Y} H${lerp(L, 540 - gap / 2, line)}`} stroke={C.lineStrong} strokeWidth={8} strokeDasharray="18 16" strokeDashoffset={-2 * Math.min(f, CUT_AT)} />
            <path d={`M${R} ${Y} H${lerp(R, 540 + gap / 2, line)}`} stroke={C.lineStrong} strokeWidth={8} strokeDasharray="18 16" strokeDashoffset={-2 * Math.min(f, CUT_AT)} />
          </>
        )}
        {cut > 0 && (
          <g transform={`translate(540 ${Y}) scale(${cut}) rotate(${(1 - cut) * -90})`} stroke={C.expense} strokeWidth={10} strokeLinecap="round">
            <path d="M-28 -28L28 28M28 -28L-28 28" />
          </g>
        )}
      </svg>
      {CHIPS.map((c, i) => {
        const s = prog(f, c.strike, 14);
        return (
          <div
            key={c.label}
            style={{
              ...glass,
              ...fadeUp(prog(f, 30 + i * 10, 22), 30),
              position: 'absolute',
              top: 880 + i * 190,
              left: 190 + kick(f, c.strike, 12, 7),
              width: 700,
              height: 140,
              borderRadius: 999,
              display: 'grid',
              placeItems: 'center',
            }}
          >
            <span style={{position: 'relative', fontFamily: body, fontWeight: 800, fontSize: 56, color: c.strike <= f ? C.inkFaint : C.ink}}>
              {c.label}
              <span style={{position: 'absolute', left: -16, right: -16, top: '52%', height: 8, borderRadius: 4, background: C.expense, transform: `scaleX(${s})`, transformOrigin: 'left'}} />
            </span>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};
