// S2 — Where: Reports. The Range chips light as the voice names them (the figures recount each time; Custom
// opens its dates on the range already shown, then Month comes back), Export is pressed (punch-in), and the
// menu offers CSV and Excel; Excel is tapped.
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {type CameraKey, type Cue, prog} from '../../lib/core';
import {E, Tap, fresh, hitPulse, pressScale, punch, usePhoneIn} from '../../lib/motion';
import {C} from '../../lib/palette';
import {Phone} from '../../lib/Phone';
import {CHIPS_Y, CHIP_AT, EXPORT_BTN, MENU, PHONE, type Preset, Reports, ZOOM, between, menuItem, toScene} from '../Reports';
import {cue} from '../voice';

// VO: "Buka Laporan." | "Pilih rentangnya:" | "bulan ini," | "tiga bulan," | "setahun," | "atau tanggal sendiri."
//     | "Ketuk Export," | "lalu pilih:" | "CSV," | "atau EXCEL."
const PICKS: {at: number; to: Preset}[] = [
  {at: cue('S2', 2, 0.1), to: 'Month'},
  {at: cue('S2', 3, 0.1), to: '3 months'},
  {at: cue('S2', 4, 0.1), to: 'Year'},
  {at: cue('S2', 5, 0.15), to: 'Custom'},
  {at: cue('S2', 5, 1) + 10, to: 'Month'}, // back to the month: the export below is October
];
const EXPORT_AT = cue('S2', 6, 0.45);
const MENU_AT = EXPORT_AT + 6;
const CSV_AT = cue('S2', 8, 0.1);
const XLSX_AT = cue('S2', 9, 0.2);
const PICK_XLSX = cue('S2', 9, 0.95);
const CLOSE_AT = PICK_XLSX + 8;

const BTN = toScene(EXPORT_BTN.x, EXPORT_BTN.y);
const CHIPS = toScene(197, CHIPS_Y);
const MENU_MID = toScene(menuItem(0).x, MENU.top + 48);
const XLSX = toScene(menuItem(1).x, menuItem(1).y);

export const camera: CameraKey[] = [
  {at: 0, zoom: 1, x: 540, y: 960, dur: 1},
  {at: cue('S2', 1) - 6, zoom: 1.5, x: 540, y: CHIPS.y},
  // "Ketuk Export": hard cut in on the button as it is pressed, then out to the menu under it.
  ...punch(EXPORT_AT - 2, BTN.x, BTN.y, {zoom: 1.6, x: MENU_MID.x, y: MENU_MID.y}, 2.4, 22),
];

export const sfx: Cue[] = [
  ...PICKS.map(({at}) => ({at, sound: 'tap', volume: 0.6})),
  ...PICKS.slice(1).map(({at}) => ({at: at + 16, sound: 'tick', volume: 0.35})),
  {at: EXPORT_AT, sound: 'tap', volume: 0.8},
  {at: MENU_AT, sound: 'whoosh', volume: 0.25},
  {at: PICK_XLSX, sound: 'tap', volume: 0.8},
];

export const Scene = () => {
  const f = useCurrentFrame();
  const phoneIn = usePhoneIn();
  // The range on screen: the last pick made, its figures counting over from the one before.
  const i = Math.max(0, PICKS.filter((p) => f >= p.at).length - 1);
  const now = PICKS[i];
  const before = PICKS[Math.max(0, i - 1)].to;
  const shown = between(before, now.to, prog(f, now.at, 28, E.type));
  const custom = prog(f, PICKS[3].at, 18, E.ui) * (1 - prog(f, PICKS[4].at, 16, E.ui));
  const lit = Object.fromEntries((['Month', '3 months', 'Year', 'Custom'] as const).map((r) => [r, Math.max(...PICKS.filter((p) => p.to === r).map((p) => hitPulse(f, p.at)))]));
  const menu = prog(f, MENU_AT, 14, E.out) * (1 - prog(f, CLOSE_AT, 10, E.smooth));
  return (
    <AbsoluteFill>
      <Phone w={PHONE.w} h={PHONE.h} screen={C.surface} style={{left: PHONE.left, top: PHONE.top, borderRadius: 96, ...phoneIn}}>
        <div style={{position: 'absolute', left: 0, top: 0, transformOrigin: 'top left', transform: `scale(${ZOOM})`}}>
          <Reports
            range={now.to}
            shown={shown}
            fresh={i > 0 ? fresh(f, now.at + 10, 30) : 0}
            lit={lit}
            custom={custom}
            menu={menu}
            menuLit={{csv: hitPulse(f, CSV_AT), xlsx: Math.max(hitPulse(f, XLSX_AT), f >= PICK_XLSX ? 1 - prog(f, CLOSE_AT, 10) : 0)}}
            press={pressScale(f, EXPORT_AT)}
          />
        </div>
      </Phone>
      {PICKS.map((p) => {
        const c = toScene(CHIP_AT[p.to].x, CHIP_AT[p.to].y);
        return <Tap key={p.at} f={f} at={p.at} x={c.x} y={c.y} w={(p.to === '3 months' ? 96 : p.to === 'Year' ? 64 : 80) * ZOOM} h={36 * ZOOM} />;
      })}
      <Tap f={f} at={EXPORT_AT} x={BTN.x} y={BTN.y} w={EXPORT_BTN.w * ZOOM} h={EXPORT_BTN.h * ZOOM} />
      <Tap f={f} at={PICK_XLSX} x={XLSX.x} y={XLSX.y} w={(MENU.w - 8) * ZOOM} h={MENU.item * ZOOM} r={12 * ZOOM} />
    </AbsoluteFill>
  );
};
