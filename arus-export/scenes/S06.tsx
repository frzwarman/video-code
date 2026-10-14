// S6 — Safe: a note somebody typed as `=HYPERLINK(…)` stays text. In the .xlsx it is an inline string (shown
// as typed, left-aligned, never evaluated); in the CSV the app puts an apostrophe in front of it.
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {type CameraKey, type Cue, prog} from '../../lib/core';
import {Marker, YELLOW_MARK} from '../../lib/Fx';
import {E, hitPulse} from '../../lib/motion';
import {C, body} from '../../lib/palette';
import {PANEL} from '../../lib/ui';
import {ROWS} from '../data';
import {cue} from '../voice';

// VO: "Dan catatan yang diawali tanda sama dengan" | "TIDAK akan pernah dijalankan sebagai rumus."
const NOTE = ROWS.find((t) => t.note)!; // MARTABAK, row 16
const NUM = ROWS.indexOf(NOTE) + 2;
const IN_AT = 2;
const EQ_AT = cue('S6', 0, 0.75); // "tanda sama dengan": the "=" is marked
const NOT_AT = cue('S6', 1, 0.05); // "TIDAK"
const CHIP_AT = cue('S6', 1, 0.35);
const CSV_AT = cue('S6', 1, 0.55); // the CSV's apostrophe

const GRID = {left: 60, top: 520, w: 960};
const W = {num: 70, payee: 260, note: 630};
const ROW_H = 72;
const NEAR = [ROWS[ROWS.indexOf(NOTE) - 1], NOTE, ROWS[ROWS.indexOf(NOTE) + 1]];

export const camera: CameraKey[] = [
  {at: 0, zoom: 1.1, x: 540, y: 820, dur: 1},
  {at: NOT_AT - 10, zoom: 1.35, x: GRID.left + W.num + W.payee + 200, y: GRID.top + 60 + 56 + ROW_H * 1.5},
  {at: CSV_AT - 6, zoom: 1.05, x: 540, y: 1000},
];

export const sfx: Cue[] = [
  {at: EQ_AT, sound: 'click', volume: 0.5},
  {at: NOT_AT, sound: 'thud', volume: 0.5},
  {at: CHIP_AT, sound: 'snap', volume: 0.5},
  {at: CSV_AT, sound: 'click', volume: 0.5},
];

const arrive = (f: number, at: number) => ({opacity: prog(f, at, 10, E.smooth), transform: `translateY(${(1 - prog(f, at, 24, E.out)) * 24}px)`});

export const Scene = () => {
  const f = useCurrentFrame();
  const not = hitPulse(f, NOT_AT, 3, 10);
  const mono = 'ui-monospace, Menlo, monospace';
  return (
    <AbsoluteFill style={{fontFamily: body, color: C.ink}}>
      <div style={{position: 'absolute', left: GRID.left, top: GRID.top, width: GRID.w, ...PANEL, borderRadius: 22, overflow: 'hidden', ...arrive(f, IN_AT)}}>
        {/* Formula bar: the cell holds exactly what was typed. */}
        <div style={{display: 'flex', alignItems: 'center', gap: 16, height: 60, padding: '0 20px', borderBottom: `1px solid ${C.line}`, fontSize: 26}}>
          <span style={{fontStyle: 'italic', fontWeight: 700, color: C.inkFaint}}>fx</span>
          <span style={{fontFamily: mono, fontSize: 25}}>{NOTE.note}</span>
        </div>
        <div style={{display: 'flex', height: 56, background: 'oklch(0.9 0.035 165)', fontSize: 26, fontWeight: 800}}>
          <span style={{width: W.num, background: C.sunken}} />
          <span style={{width: W.payee, display: 'flex', alignItems: 'center', padding: '0 16px', borderLeft: `1px solid ${C.line}`}}>Payee</span>
          <span style={{width: W.note, display: 'flex', alignItems: 'center', padding: '0 16px', borderLeft: `1px solid ${C.line}`}}>Note</span>
        </div>
        {NEAR.map((t, k) => {
          const hot = t === NOTE;
          return (
            <div key={k} style={{position: 'relative', display: 'flex', height: ROW_H, borderTop: `1px solid ${C.line}`, fontSize: 28, opacity: hot ? 1 : 0.45}}>
              <span style={{width: W.num, display: 'grid', placeItems: 'center', background: C.sunken, fontSize: 20, fontWeight: 600, color: C.inkFaint}}>{NUM - 1 + k}</span>
              <span style={{width: W.payee, display: 'flex', alignItems: 'center', padding: '0 16px', borderLeft: `1px solid ${C.line}`, fontWeight: hot ? 700 : 400}}>{t.payee}</span>
              <span style={{width: W.note, display: 'flex', alignItems: 'center', padding: '0 16px', borderLeft: `1px solid ${C.line}`, fontFamily: mono, fontSize: 26, transform: hot ? `translateX(${Math.sin((f - NOT_AT) * 1.6) * 8 * not}px)` : undefined}}>
                {hot && (
                  <Marker at={EQ_AT} f={f} color={YELLOW_MARK}>
                    {t.note}
                  </Marker>
                )}
              </span>
              {hot && <div style={{position: 'absolute', left: W.num + W.payee, top: 0, width: W.note, height: ROW_H, border: `3px solid ${C.accentStrong}`, boxSizing: 'border-box'}} />}
            </div>
          );
        })}
      </div>
      {/* "teks, bukan rumus" */}
      {f >= CHIP_AT && (
        <div style={{position: 'absolute', left: 0, right: 0, top: GRID.top + 60 + 56 + ROW_H * 3 + 40, display: 'flex', justifyContent: 'center', ...arrive(f, CHIP_AT)}}>
          <div style={{padding: '16px 30px', borderRadius: 999, background: C.raised, fontSize: 40, fontWeight: 800, boxShadow: '0 16px 36px -20px oklch(0.2 0.06 168 / 0.6)'}}>teks, bukan rumus</div>
        </div>
      )}
      {/* The same note in the CSV: an apostrophe in front, so a spreadsheet reads it as text. */}
      {f >= CSV_AT - 10 && (
        <div style={{position: 'absolute', left: 40, right: 40, top: 1180, ...PANEL, borderRadius: 22, padding: '22px 24px', ...arrive(f, CSV_AT - 10)}}>
          <div style={{fontSize: 24, fontWeight: 700, color: C.inkSoft, marginBottom: 10}}>CSV</div>
          <div style={{fontFamily: mono, fontSize: 25, whiteSpace: 'nowrap', overflow: 'hidden'}}>
            …,MARTABAK,&quot;
            <span style={{position: 'relative', display: 'inline-block'}}>
              <span style={{position: 'absolute', inset: '-4px -6px', borderRadius: 999, border: `3px solid ${C.accentStrong}`, opacity: prog(f, CSV_AT, 10, E.smooth), transform: `scale(${1 + 0.4 * hitPulse(f, CSV_AT + 4)})`}} />
              &apos;
            </span>
            =HYPERLINK(&quot;&quot;bit.ly/promo&quot;&quot;)&quot;,…
          </div>
        </div>
      )}
    </AbsoluteFill>
  );
};
