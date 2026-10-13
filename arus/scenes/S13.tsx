// S13 · 58.07–63.4s — No third-party trackers. Only people you invite can see your data.
import type {ComponentType} from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {type CameraKey, type Cue, back, cue, kick, prog} from '../core';
import {EyeOff, Users} from '../icons';
import {C, body, display, glass} from '../palette';

const ITEMS: {text: string; Icon: ComponentType<{size: number; color: string; slash?: number}>; at: number; top: number}[] = [
  {text: 'Tanpa pelacak pihak ketiga', Icon: EyeOff, at: 0, top: 540},
  {text: 'Hanya yang kamu undang yang bisa melihat', Icon: Users, at: cue('S13', 1), top: 1010},
];
// What a tracker-free app leaves out, struck through one by one.
const BLOCKED = ['Analitik', 'Iklan', 'Pelacak'];
const blockAt = (i: number) => cue('S13', 0, 0.35) + i * 12;
// Who can see the workspace: the three from S8, and not the fourth.
const PEOPLE = [
  {initial: 'A', tint: C.accent, at: cue('S13', 1, 0.45)},
  {initial: 'R', tint: C.transfer, at: cue('S13', 1, 0.45) + 12},
  {initial: 'D', tint: C.warn, at: cue('S13', 1, 0.45) + 24},
];
const STRANGER_AT = cue('S13', 1, 0.75);
const DENY_AT = cue('S13', 1, 0.92);

// Lean onto the second card, then onto the people, then out.
export const camera: CameraKey[] = [{at: cue('S13', 1) - 10, zoom: 1.2, x: 540, y: 1150, dur: 30}, {at: STRANGER_AT - 10, zoom: 1.35, x: 540, y: 1300, dur: 30}, {at: DENY_AT + 30, zoom: 1, dur: 30}];

export const sfx: Cue[] = [...ITEMS.map((x) => ({at: x.at + 6, sound: 'click', volume: 0.45})), ...BLOCKED.map((_, i) => ({at: blockAt(i), sound: 'snap', volume: 0.4})), ...PEOPLE.map((p) => ({at: p.at, sound: 'click', volume: 0.35})), {at: DENY_AT, sound: 'thud', volume: 0.6}];

export const Scene = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill>
      {ITEMS.map(({text, Icon, at, top}, i) => {
        const p = prog(f, at, 24);
        return (
        <div
          key={text}
          style={{
            ...glass,
            opacity: p,
            transform: `perspective(1600px) translateY(${(1 - p) * 50}px) rotateX(${(1 - p) * 25}deg)`,
            transformOrigin: 'center bottom',
            position: 'absolute',
            top,
            left: 100,
            width: 880,
            height: 280,
            display: 'flex',
            alignItems: 'center',
            gap: 44,
            padding: '0 56px',
            boxSizing: 'border-box',
          }}
        >
          <div style={{flex: 'none', width: 140, height: 140, borderRadius: 40, background: C.accentSoft, display: 'grid', placeItems: 'center'}}>
            <Icon size={84} color={C.accentStrong} slash={i === 0 ? prog(f, at + 26, 14) : 1} />
          </div>
          <div style={{fontFamily: body, fontWeight: 800, fontSize: 54, lineHeight: 1.2, color: C.ink}}>{text}</div>
        </div>
        );
      })}
      <div style={{position: 'absolute', top: 870, width: '100%', display: 'flex', justifyContent: 'center', gap: 22}}>
        {BLOCKED.map((label, i) => {
          const inP = prog(f, 30 + i * 8, 18);
          const s = prog(f, blockAt(i), 12);
          return (
            <div key={label} style={{position: 'relative', padding: '12px 30px', borderRadius: 999, background: C.surface, border: `2px solid ${C.glassLine}`, fontFamily: body, fontWeight: 800, fontSize: 34, color: f >= blockAt(i) ? C.inkFaint : C.ink, opacity: inP, transform: `translateY(${(1 - inP) * 24}px) translateX(${kick(f, blockAt(i), 8, 6)}px)`}}>
              {label}
              <span style={{position: 'absolute', left: 22, right: 22, top: '50%', height: 6, borderRadius: 3, background: C.expense, transform: `scaleX(${s})`, transformOrigin: 'left'}} />
            </div>
          );
        })}
      </div>
      <div style={{position: 'absolute', top: 1340, width: '100%', display: 'flex', justifyContent: 'center', gap: 28}}>
        {PEOPLE.map(({initial, tint, at}) => {
          const p = prog(f, at, 18, back);
          return (
            <div key={initial} style={{width: 110, height: 110, borderRadius: '50%', background: tint, display: 'grid', placeItems: 'center', fontFamily: display, fontWeight: 700, fontSize: 50, color: C.surface, opacity: prog(f, at, 8), transform: `scale(${0.8 + 0.2 * p})`}}>
              {initial}
            </div>
          );
        })}
        {(() => {
          const p = prog(f, STRANGER_AT, 18, back);
          const deny = prog(f, DENY_AT, 14);
          return (
            <div style={{position: 'relative', width: 110, height: 110, borderRadius: '50%', background: C.surface, border: `3px dashed ${C.inkFaint}`, boxSizing: 'border-box', display: 'grid', placeItems: 'center', fontFamily: display, fontWeight: 700, fontSize: 50, color: C.inkFaint, opacity: prog(f, STRANGER_AT, 8), transform: `scale(${0.8 + 0.2 * p}) translateX(${kick(f, DENY_AT, 8, 6)}px)`}}>
              ?
              <svg width={110} height={110} viewBox="0 0 110 110" style={{position: 'absolute', inset: 0}}>
                <path d="M28 28L82 82M82 28L28 82" stroke={C.expense} strokeWidth={9} strokeLinecap="round" pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - deny} opacity={deny > 0 ? 1 : 0} />
              </svg>
            </div>
          );
        })()}
      </div>
    </AbsoluteFill>
  );
};
