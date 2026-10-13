// S4 · 15.18–21.5s — "Ini Arus." Logo, then cash · bank · e-wallet cards land.
import type {ComponentType} from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {type CameraKey, type Cue, back, cue, fadeUp, lerp, prog, roundK, rupiah, voiceEnd} from '../core';
import {Bank, Cash, Wallet} from '../icons';
import {Logo} from '../Logo';
import {C, body, display, glass} from '../palette';

const LIFT_AT = cue('S4', 1) - 10;
const HEAD_AT = cue('S4', 1) + 14; // "Semua rekeningmu di SATU tempat", once the logo is out of the way
const HEADLINE = ['Semua', 'rekeningmu', 'di', 'satu', 'tempat'];
const KEY_WORD = 3; // logo moves up to make room
// VO: "…tunai, bank, dan e-wallet." Totals Rp 947.000, reused in S8.
const CARDS: {name: string; kind: string; amount: number; Icon: ComponentType<{size: number; color: string}>; at: number}[] = [
  {name: 'Tunai', kind: 'Tunai', amount: 450_000, Icon: Cash, at: cue('S4', 2)},
  {name: 'BCA', kind: 'Bank', amount: 312_000, Icon: Bank, at: cue('S4', 3)},
  {name: 'E-wallet', kind: 'E-wallet', amount: 185_000, Icon: Wallet, at: cue('S4', 4)},
];

const TOTAL_AT = voiceEnd('S4') + 4;

// Lean into the cards as they land, back out for the total.
export const camera: CameraKey[] = [{at: cue('S4', 2) - 10, zoom: 1.2, x: 540, y: 900, dur: 40}, {at: TOTAL_AT - 10, zoom: 1, dur: 30}];

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
        <div style={{fontFamily: display, fontWeight: 700, fontSize: 88, color: C.ink}}>
          {'Arus'.split('').map((ch, i) => (
            <span key={i} style={{display: 'inline-block', ...fadeUp(prog(f, 8 + i * 4, 18), 24)}}>
              {ch}
            </span>
          ))}
        </div>
      </div>
      {/* The claim itself, word by word, between the logo and the cards it describes. */}
      <div style={{position: 'absolute', top: 436, left: 40, right: 40, textAlign: 'center', fontFamily: display, fontWeight: 700, fontSize: 52, lineHeight: 1.15, whiteSpace: 'nowrap'}}>
        {HEADLINE.map((w, i) => {
          const p = prog(f, HEAD_AT + i * 4, 18);
          const key = i === KEY_WORD;
          return (
            <span key={w}>
              <span style={{display: 'inline-block', marginRight: '0.3em', color: key ? C.highlight : C.ink, opacity: p, transform: `translateY(${(1 - p) * 24}px) scale(${key ? 0.9 + 0.1 * prog(f, HEAD_AT + i * 4, 18, back) : 1})`}}>
                {w}
              </span>
              {i === 1 && <br />}
            </span>
          );
        })}
      </div>
      {CARDS.map(({name, kind, amount, Icon, at}, i) => {
        const p = prog(f, at, 24, back);
        return (
          <div
            key={name}
            style={{
              ...glass,
              ...fadeUp(prog(f, at, 14), 0),
              position: 'absolute',
              top: 600 + i * 250,
              left: 100,
              width: 880,
              height: 210,
              display: 'flex',
              alignItems: 'center',
              gap: 36,
              padding: '0 52px',
              boxSizing: 'border-box',
              transform: `perspective(1600px) translateY(${(1 - p) * 80}px) rotateX(${(1 - p) * 30}deg)`,
              transformOrigin: 'center bottom',
            }}
          >
            <div style={{width: 112, height: 112, borderRadius: 32, background: C.accentSoft, display: 'grid', placeItems: 'center', transform: `rotate(${(1 - p) * -20}deg) scale(${0.8 + 0.2 * p})`}}>
              <Icon size={64} color={C.accent} />
            </div>
            <div style={{flex: 1, fontFamily: body}}>
              <div style={{fontWeight: 800, fontSize: 48, color: C.ink}}>{name}</div>
              <div style={{fontWeight: 600, fontSize: 32, color: C.inkFaint}}>{kind}</div>
            </div>
            <div style={{fontFamily: body, fontWeight: 800, fontSize: 50, color: C.ink, fontVariantNumeric: 'tabular-nums'}}>{rupiah(roundK(amount * prog(f, at + 6, 22)))}</div>
          </div>
        );
      })}
      {/* The three add up: the figure S8 shows on every phone. */}
      <div style={{position: 'absolute', top: 1352, left: 100, width: 880 * prog(f, TOTAL_AT, 20), height: 3, background: C.highlight, opacity: 0.5}} />
      <div style={{position: 'absolute', top: 1378, left: 100, right: 100, display: 'flex', justifyContent: 'space-between', fontFamily: body, fontWeight: 800, fontSize: 46, color: C.highlight, ...fadeUp(prog(f, TOTAL_AT + 6, 20))}}>
        <span>Total</span>
        <span style={{fontVariantNumeric: 'tabular-nums'}}>{rupiah(roundK(947_000 * prog(f, TOTAL_AT + 10, 26)))}</span>
      </div>
    </AbsoluteFill>
  );
};
