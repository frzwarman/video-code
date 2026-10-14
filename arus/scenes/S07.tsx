// S7 — The real Arus Home (after the revamp) in a phone. The camera goes where the voice goes: the
// "In this month" tile, the "Out this month" tile, then scrolls to a transfer in Recent activity.
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {type CameraKey, type Cue, fadeUp, inOut, prog} from '../../lib/core';
import {cue} from '../voice';
import {APP_W, HOME, Home, TabBar} from '../../lib/Home';
import {Phone, bezel} from '../../lib/Phone';
import {C} from '../../lib/palette';

// VO: "Dasbor menunjukkan ALUR uangmu:" | "pemasukan," | "pengeluaran," | "dan transfer antar-rekening."
const INCOME_AT = cue('S7', 1);
const EXPENSE_AT = cue('S7', 2);
const TRANSFER_AT = cue('S7', 3);
const SCROLL_AT = TRANSFER_AT - 20;

const PHONE = {left: 240, top: 300, w: 600, h: 1300};
const BZ = bezel(PHONE.w, PHONE.h);
const ZOOM = BZ.screenW / APP_W;
const SCROLL = HOME.transferRow.y - 420; // app px: brings the transfer row to the upper middle of the screen
const toScene = (x: number, y: number) => ({x: PHONE.left + BZ.inset + x * ZOOM, y: PHONE.top + BZ.inset + y * ZOOM});
const IN = toScene(HOME.inTile.x, HOME.inTile.y);
const OUT = toScene(HOME.outTile.x, HOME.outTile.y);
const TRANSFER = toScene(HOME.transferRow.x, HOME.transferRow.y - SCROLL);

export const camera: CameraKey[] = [
  {at: 0, zoom: 1.25, x: 540, y: 520, dur: 1},
  {at: INCOME_AT - 8, zoom: 1.9, x: IN.x, y: IN.y, dur: 30},
  {at: EXPENSE_AT - 8, zoom: 1.9, x: OUT.x, y: OUT.y, dur: 30},
  {at: SCROLL_AT, zoom: 1, dur: 30},
  {at: TRANSFER_AT + 24, zoom: 1.7, x: TRANSFER.x, y: TRANSFER.y, dur: 30},
];

export const sfx: Cue[] = [
  {at: INCOME_AT, sound: 'click', volume: 0.5},
  {at: EXPENSE_AT, sound: 'click', volume: 0.5},
  {at: SCROLL_AT, sound: 'whoosh', volume: 0.35},
  {at: TRANSFER_AT + 30, sound: 'snap', volume: 0.6},
];

export const Scene = () => {
  const f = useCurrentFrame();
  const phoneIn = prog(f, 0, 26);
  const scroll = SCROLL * prog(f, SCROLL_AT, 44, inOut);
  const lit = {
    in: prog(f, INCOME_AT, 10) * (1 - prog(f, EXPENSE_AT - 6, 10)),
    out: prog(f, EXPENSE_AT, 10) * (1 - prog(f, SCROLL_AT, 10)),
    transfer: prog(f, TRANSFER_AT + 30, 12),
  };
  return (
    <AbsoluteFill>
      <Phone w={PHONE.w} h={PHONE.h} screen={C.surface} style={{left: PHONE.left, top: PHONE.top, borderRadius: 96, ...fadeUp(phoneIn, 90)}}>
        <div style={{position: 'absolute', left: 0, top: 0, width: APP_W, transformOrigin: 'top left', transform: `scale(${ZOOM}) translateY(${-scroll}px)`}}>
          <Home f={f} lit={lit} countFrom={10} />
        </div>
        {/* The tab bar stays put while the page scrolls under it. */}
        <div style={{position: 'absolute', left: 0, bottom: 0, width: APP_W, height: 86, transformOrigin: 'bottom left', transform: `scale(${ZOOM})`}}>
          <TabBar />
        </div>
      </Phone>
    </AbsoluteFill>
  );
};
