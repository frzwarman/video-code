// S3 — Every row: the toast and the download land; the phone steps aside and the file's rows stream out beside
// it, counted to 20: every transaction in the range, not just what the screen shows (Reports shows charts).
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {type CameraKey, type Cue, lerp, prog} from '../../lib/core';
import {Marker, YELLOW_MARK} from '../../lib/Fx';
import {Lucide} from '../../lib/lucide';
import {E, hitPulse, usePhoneIn} from '../../lib/motion';
import {C, body, display} from '../../lib/palette';
import {Phone} from '../../lib/Phone';
import {PANEL} from '../../lib/ui';
import {FILE, ROWS, direction, grouped} from '../data';
import {COUNT_Y, PHONE, RANGES, Reports, ZOOM} from '../Reports';
import {cue} from '../voice';

// VO: "SEMUA transaksi di rentang itu ikut," | "bukan cuma yang terlihat di layar."
const TOAST_AT = 6;
const BANNER_AT = 16;
const STEP_AT = cue('S3', 0, 0.05); // the phone steps aside…
const STREAM_AT = STEP_AT + 14; // …and the file's rows stream out, 3 f apart
const COUNT_DUR = 20 * 3 + 18;
const MARK_AT = cue('S3', 0, 0.55);
const ALL_AT = cue('S3', 1, 0.45); // "terlihat di layar": all 20 lock in

const COL = {left: 640, top: 440, w: 400, row: 46};

export const camera: CameraKey[] = [{at: 0, zoom: 1, x: 540, y: 960, dur: 1}];

export const sfx: Cue[] = [
  {at: TOAST_AT, sound: 'ding', volume: 0.5},
  {at: STEP_AT, sound: 'whoosh', volume: 0.3},
  ...Array.from({length: 10}, (_, i) => ({at: STREAM_AT + i * 6, sound: 'tick', volume: 0.25})),
  {at: STREAM_AT + COUNT_DUR, sound: 'snap', volume: 0.6},
  {at: ALL_AT, sound: 'click', volume: 0.5},
];

export const Scene = () => {
  const f = useCurrentFrame();
  const phoneIn = usePhoneIn();
  const step = prog(f, STEP_AT, 34, E.glide);
  const toast = prog(f, TOAST_AT, 22, E.out);
  const banner = prog(f, BANNER_AT, 22, E.out);
  const count = Math.round(20 * prog(f, STREAM_AT, COUNT_DUR, E.type));
  const all = hitPulse(f, ALL_AT, 3, 10);
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', inset: 0, transformOrigin: `${PHONE.left}px 960px`, transform: `translateX(${-200 * step}px) scale(${lerp(1, 0.78, step)})`}}>
        <Phone w={PHONE.w} h={PHONE.h} screen={C.surface} style={{left: PHONE.left, top: PHONE.top, borderRadius: 96, ...phoneIn}}>
          <div style={{position: 'absolute', left: 0, top: 0, transformOrigin: 'top left', transform: `scale(${ZOOM})`, fontFamily: body}}>
            <Reports
              range="Month"
              shown={RANGES.Month}
              countMark={(text) => (
                <Marker at={MARK_AT} f={f} color={YELLOW_MARK}>
                  {text}
                </Marker>
              )}
            />
            {/* The download, dropping in from the top of the screen. */}
            <div style={{position: 'absolute', left: 12, right: 12, top: 44, ...PANEL, borderRadius: 18, padding: '10px 12px', display: 'flex', alignItems: 'center', gap: 10, opacity: prog(f, BANNER_AT, 10, E.smooth), transform: `translateY(${(1 - banner) * -70}px)`}}>
              <span style={{display: 'grid', placeItems: 'center', width: 32, height: 32, borderRadius: 10, background: C.incomeSoft}}>
                <Lucide name="download" size={16} color={C.income} strokeWidth={2.6} />
              </span>
              <div style={{minWidth: 0}}>
                <div style={{fontSize: 12, fontWeight: 600, color: C.inkSoft}}>Downloaded</div>
                <div style={{fontSize: 13, fontWeight: 800, color: C.ink, whiteSpace: 'nowrap'}}>{FILE}.xlsx</div>
              </div>
            </div>
            {/* The app's toast. */}
            <div style={{position: 'absolute', left: 16, right: 16, bottom: 100, ...PANEL, borderRadius: 16, padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 12, opacity: prog(f, TOAST_AT, 10, E.smooth), transform: `translateY(${(1 - toast) * 40}px)`}}>
              <span style={{display: 'grid', placeItems: 'center', width: 32, height: 32, borderRadius: '50%', background: C.incomeSoft}}>
                <Lucide name="circleCheck" size={18} color={C.income} />
              </span>
              <div style={{fontSize: 14, fontWeight: 700}}>Exported 20 transactions</div>
            </div>
          </div>
        </Phone>
      </div>
      {/* The file's rows, streaming out beside the phone, counted. */}
      {f >= STREAM_AT - 6 && (
        <div style={{position: 'absolute', left: COL.left, top: COL.top - 150, width: COL.w, fontFamily: body, color: C.onBand}}>
          <div style={{display: 'flex', alignItems: 'baseline', gap: 14, opacity: prog(f, STREAM_AT - 6, 12, E.smooth)}}>
            <span style={{fontFamily: display, fontWeight: 800, fontSize: 120, lineHeight: 1, letterSpacing: -3, fontVariantNumeric: 'tabular-nums', transform: `scale(${1 + 0.06 * hitPulse(f, STREAM_AT + COUNT_DUR) + 0.05 * all})`, display: 'inline-block', transformOrigin: 'left bottom'}}>{count}</span>
            <span style={{fontSize: 40, fontWeight: 700, color: C.onBandSoft}}>baris</span>
          </div>
        </div>
      )}
      {ROWS.map((t, i) => {
        const at = STREAM_AT + i * 3;
        if (f < at) return null;
        const p = prog(f, at, 20, E.out);
        return (
          <div key={i} style={{position: 'absolute', left: COL.left, top: COL.top + i * COL.row, width: COL.w, height: COL.row - 8, borderRadius: 12, background: C.raised, boxShadow: '0 10px 24px -14px oklch(0.2 0.06 168 / 0.55)', display: 'flex', alignItems: 'center', gap: 10, padding: '0 14px', boxSizing: 'border-box', fontFamily: body, fontSize: 20, fontVariantNumeric: 'tabular-nums', color: C.ink, opacity: prog(f, at, 8, E.smooth), transform: `translateX(${(1 - p) * -120}px)`, outline: all > 0.02 ? `2px solid oklch(0.67 0.165 160 / ${all.toFixed(3)})` : undefined}}>
            <span style={{color: C.inkSoft}}>{t.date.slice(5)}</span>
            <span style={{flex: 1, fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>{t.payee ?? `→ ${t.to}`}</span>
            <span style={{fontWeight: 800, color: direction(t) === 'out' ? C.expense : direction(t) === 'in' ? C.income : C.transfer}}>{grouped(t.amount)}</span>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};
