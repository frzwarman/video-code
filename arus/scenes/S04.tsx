// S4 — "Ini Arus." Logo, the claim, then the three account cards land: the Accounts page look (cash sun,
// bank ocean, e-wallet grape: a soft tone card with two blobs, an icon tile and a big balance).
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {type CameraKey, type Cue, back, cue, fadeUp, lerp, prog, roundK, rupiah, voiceEnd} from '../core';
import {Marker} from '../Fx';
import {Logo} from '../Logo';
import {ACCOUNT, Lucide} from '../lucide';
import {C, body, display, pop} from '../palette';

const LIFT_AT = cue('S4', 1) - 10; // logo moves up to make room
const HEAD_AT = cue('S4', 1) + 14; // "Semua rekeningmu di SATU tempat", once the logo is out of the way
const HEADLINE = ['Semua', 'rekeningmu', 'di', 'satu', 'tempat'];
const KEY_WORD = 3;
// VO: "…tunai, bank, dan e-wallet." Totals Rp 947.000, reused in S8.
const CARDS = [
  {name: 'Tunai', kind: 'cash', amount: 450_000, at: cue('S4', 2)},
  {name: 'BCA', kind: 'bank', amount: 312_000, at: cue('S4', 3)},
  {name: 'E-wallet', kind: 'ewallet', amount: 185_000, at: cue('S4', 4)},
] as const;
const TOTAL_AT = voiceEnd('S4') + 4;

// Lean into the cards as they land, back out for the total.
export const camera: CameraKey[] = [{at: 0, zoom: 1.35, x: 540, y: 800, dur: 1}, {at: LIFT_AT, zoom: 1, dur: 36}, {at: cue('S4', 2) - 10, zoom: 1.2, x: 540, y: 900, dur: 40}, {at: TOTAL_AT - 10, zoom: 1, dur: 30}];

export const sfx: Cue[] = [{at: HEAD_AT, sound: 'tick', volume: 0.4}, ...CARDS.map((c) => ({at: c.at + 12, sound: 'click', volume: 0.5}))];

export const Scene = () => {
  const f = useCurrentFrame();
  const intro = prog(f, 0, 28, back);
  const lift = prog(f, LIFT_AT, 40);

  return (
    <AbsoluteFill>
      <div
        style={{
          position: 'absolute',
          top: lerp(780, 290, lift),
          width: '100%',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: lerp(40, 28, lift),
          transform: `scale(${lerp(1.5, 1, lift) * (0.7 + 0.3 * intro)})`,
          opacity: prog(f, 0, 14),
        }}
      >
        <Logo size={120} draw={prog(f, 10, 30)} />
        <div style={{fontFamily: display, fontWeight: 800, fontSize: 88, letterSpacing: -2, color: C.onBand}}>
          {'Arus'.split('').map((ch, i) => (
            <span key={i} style={{display: 'inline-block', ...fadeUp(prog(f, 8 + i * 4, 18), 24)}}>
              {ch}
            </span>
          ))}
        </div>
      </div>
      {/* The claim itself, word by word, between the logo and the cards it describes. */}
      <div style={{position: 'absolute', top: 436, left: 40, right: 40, textAlign: 'center', fontFamily: display, fontWeight: 800, fontSize: 52, lineHeight: 1.15, whiteSpace: 'nowrap', color: C.onBand}}>
        {HEADLINE.map((w, i) => {
          const p = prog(f, HEAD_AT + i * 4, 18);
          return (
            <span key={w}>
              <span style={{display: 'inline-block', marginRight: '0.3em', opacity: p, transform: `translateY(${(1 - p) * 24}px)`}}>
                {i === KEY_WORD ? <Marker at={HEAD_AT + KEY_WORD * 4 + 12} f={f}>{w}</Marker> : w}
              </span>
              {i === 1 && <br />}
            </span>
          );
        })}
      </div>
      {CARDS.map(({name, kind, amount, at}, i) => {
        const p = prog(f, at, 24, back);
        const look = ACCOUNT[kind];
        const tone = pop(look.tone);
        return (
          <div
            key={name}
            style={{
              position: 'absolute',
              top: 600 + i * 250,
              left: 100,
              width: 880,
              height: 210,
              borderRadius: 48,
              background: tone.soft,
              overflow: 'hidden',
              boxShadow: '0 2px 4px oklch(0.3 0.06 168 / 0.06), 0 24px 56px -32px oklch(0.3 0.06 168 / 0.3)',
              opacity: prog(f, at, 14),
              transform: `perspective(1600px) translateY(${(1 - p) * 80}px) rotateX(${(1 - p) * 30}deg)`,
              transformOrigin: 'center bottom',
            }}
          >
            {/* Two soft circles in the corner: the wallet-card look. */}
            <div style={{position: 'absolute', top: -130, right: -90, width: 320, height: 320, borderRadius: '50%', background: tone.strong, opacity: 0.15}} />
            <div style={{position: 'absolute', top: -20, right: -190, width: 320, height: 320, borderRadius: '50%', background: tone.strong, opacity: 0.1}} />
            <div style={{position: 'absolute', left: 52, top: 49, width: 112, height: 112, borderRadius: 32, background: C.raised, display: 'grid', placeItems: 'center', transform: `rotate(${lerp(-150, 0, p)}deg) scale(${0.8 + 0.2 * p})`}}>
              <Lucide name={look.icon} size={56} color={tone.strong} />
            </div>
            <div style={{position: 'absolute', left: 200, top: 46, fontFamily: body}}>
              <div style={{fontWeight: 800, fontSize: 48, color: C.ink}}>{name}</div>
              <div style={{fontWeight: 600, fontSize: 30, color: C.inkSoft}}>{look.label}</div>
            </div>
            <div style={{position: 'absolute', right: 52, top: 72, fontFamily: body, fontWeight: 800, fontSize: 52, letterSpacing: -1, color: C.ink, fontVariantNumeric: 'tabular-nums'}}>{rupiah(roundK(amount * prog(f, at + 6, 22)))}</div>
          </div>
        );
      })}
      {/* The three add up: the figure S8 shows on every phone. */}
      <div style={{position: 'absolute', top: 1352, left: 100, width: 880 * prog(f, TOTAL_AT - 10, 20), height: 3, background: C.highlight, opacity: 0.5}} />
      <div style={{position: 'absolute', top: 1378, left: 100, right: 100, display: 'flex', justifyContent: 'space-between', fontFamily: body, fontWeight: 800, fontSize: 46, color: C.highlight, ...fadeUp(prog(f, TOTAL_AT - 4, 20))}}>
        <span>Total</span>
        <span style={{fontVariantNumeric: 'tabular-nums'}}>{rupiah(roundK(947_000 * prog(f, TOTAL_AT, 26)))}</span>
      </div>
    </AbsoluteFill>
  );
};
