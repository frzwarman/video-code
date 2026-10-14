// S3 — Kategori: the Categories page. A new category in the sheet (name, used for, icon, colour, previewed live
// at the top) lands in the list; an old one is archived, not deleted, and its past transaction keeps its name.
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {type CameraKey, type Cue, prog} from '../../lib/core';
import {Marker, YELLOW_MARK} from '../../lib/Fx';
import {E, Tap, hitPulse, pressScale, punch, usePhoneIn} from '../../lib/motion';
import {APP_W, TabBar} from '../../lib/Home';
import {CATEGORY, Lucide, Tile, type IconName} from '../../lib/lucide';
import {C, body, pop, type Tone} from '../../lib/palette';
import {Phone, bezel} from '../../lib/Phone';
import {Button, Chips, Colours, Field, ICON_BOX, IconGrid, Input, PANEL, PageHeader, Sheet, caretOn, iconScroll, newest, typed} from '../../lib/ui';
import {cue} from '../voice';

// VO: "Lalu kategori." | "Beri nama," | "pilih untuk pengeluaran atau pemasukan," | "pilih ikonnya," | "dan warnanya."
//     | "Kategori tidak pernah dihapus, hanya DIARSIPKAN," | "jadi catatan lama tetap punya arti."
const TAP_NEW = cue('S3', 0, 0.55);
const SHEET_UP = TAP_NEW + 8;
const NAME_AT = cue('S3', 1, 0.2); // "Olahraga" is typed
const USED_AT = [cue('S3', 2, 0.3), cue('S3', 2, 0.75)]; // pengeluaran (stays), pemasukan (named)
const SCROLL_AT = cue('S3', 3) - 8; // the icon list scrolls down to Health…
const ICON = 'dumbbell';
const SCROLL_TO = iconScroll(ICON);
const TAP_ICON = cue('S3', 3, 0.85); // …and the dumbbell is picked
const COLOR_AT = cue('S3', 4, 0.3); // Sky is picked
const SWATCH = '#0ea5e9';
const TAP_SAVE = cue('S3', 4, 0.95);
const SHEET_DOWN = TAP_SAVE + 8;
const ROW_AT = SHEET_DOWN + 14; // the new category lands in the list
const TAP_ARCHIVE = cue('S3', 5, 0.62); // "DIARSIPKAN"
const ARCHIVED_AT = TAP_ARCHIVE + 14;
const TOAST_AT = cue('S3', 6, 0.15); // an old transaction, still named
const MARK_AT = cue('S3', 6, 0.6);

const PHONE = {left: 240, top: 300, w: 600, h: 1300};
const BZ = bezel(PHONE.w, PHONE.h);
const ZOOM = BZ.screenW / APP_W;
const SCREEN_H = BZ.screenH / ZOOM;
const toScene = (x: number, y: number) => ({x: PHONE.left + BZ.inset + x * ZOOM, y: PHONE.top + BZ.inset + y * ZOOM});
const NEW_BTN = toScene(313, 72);
const SAVE_BTN = toScene(298, SCREEN_H - 50);
const ARCHIVE_BTN = toScene(346, 393);
// The sheet is bottom-anchored, so its controls are measured up from the screen's bottom edge (app px):
// 28 padding, the 44 buttons, 16 gap, two rows of 36 dots (10 apart), 16 gap, then the 224 icon box.
const DOTS_TOP = SCREEN_H - 28 - 44 - 16 - 82;
const ICON_BOX_MID = DOTS_TOP - 26 - 16 - ICON_BOX.h / 2;
const ICON_BTN = toScene(23 + 5 * (ICON_BOX.cell + ICON_BOX.gap) + ICON_BOX.cell / 2, ICON_BOX_MID); // Health, 6th icon
const SKY_DOT = toScene(16 + 6 * 46 + 18, DOTS_TOP + 18); // after Automatic and five colours

// The app's tone for a category with no colour of its own: a tiny hash of the name (categories/visual.ts).
const ROTATION: Tone[] = ['mint', 'sky', 'sun', 'coral', 'grape', 'bubblegum', 'tangerine', 'ocean'];
const autoTone = (name: string) => {
  let h = 0;
  for (const ch of name) h = (h * 31 + ch.charCodeAt(0)) | 0;
  return ROTATION[Math.abs(h) % ROTATION.length];
};
const glow = (f: number, at: number) => hitPulse(f, at);

const EXPENSES: {name: string; icon: IconName; tone: Tone}[] = [
  {name: 'Makan', ...CATEGORY.Makan},
  {name: 'Transport', ...CATEGORY.Transport},
  {name: 'Belanja', ...CATEGORY.Belanja},
  {name: 'Tagihan', ...CATEGORY.Tagihan},
  {name: 'Hiburan', ...CATEGORY.Hiburan},
];

export const camera: CameraKey[] = [
  {at: 0, zoom: 1.2, x: 540, y: 620, dur: 1},
  {at: SHEET_UP + 6, zoom: 1.45, x: 540, y: 720},
  {at: SCROLL_AT - 12, zoom: 1.4, x: 540, y: 1100},
  // The dumbbell: hard cut in as it is picked, back out for the colour.
  ...punch(TAP_ICON - 2, ICON_BTN.x, ICON_BTN.y, {zoom: 1.4, x: 540, y: 1100}, 2.3, 30),
  {at: SHEET_DOWN, zoom: 1.3, x: 540, y: 780},
  {at: TAP_ARCHIVE - 12, zoom: 1.4, x: 540, y: 900},
  {at: TOAST_AT - 6, zoom: 1.5, x: 540, y: 1350},
];

export const sfx: Cue[] = [
  {at: TAP_NEW, sound: 'tap', volume: 0.8},
  {at: SHEET_UP, sound: 'whoosh', volume: 0.35},
  ...[0, 1, 2, 3, 4, 5, 6, 7].map((i) => ({at: NAME_AT + i * 5, sound: 'tick', volume: 0.3})),
  ...USED_AT.map((at) => ({at, sound: 'tap', volume: 0.6})),
  {at: SCROLL_AT, sound: 'whoosh', volume: 0.2},
  {at: TAP_ICON, sound: 'tap', volume: 0.6},
  {at: COLOR_AT, sound: 'tap', volume: 0.6},
  {at: TAP_SAVE, sound: 'tap', volume: 0.8},
  {at: SHEET_DOWN, sound: 'whoosh', volume: 0.3},
  {at: ROW_AT, sound: 'snap', volume: 0.7},
  {at: TAP_ARCHIVE, sound: 'tap', volume: 0.7},
  {at: ARCHIVED_AT, sound: 'whoosh', volume: 0.3},
  {at: TOAST_AT, sound: 'click', volume: 0.5},
];

const Row = ({name, icon, tone, color, fade = 1}: {name: string; icon: IconName; tone: Tone; color?: string; fade?: number}) => (
  <div style={{display: 'flex', alignItems: 'center', gap: 12, height: 44, opacity: fade}}>
    {color ? (
      <span style={{display: 'grid', placeItems: 'center', width: 44, height: 44, borderRadius: 16, background: `color-mix(in oklab, ${color} 16%, ${C.raised})`, flex: 'none'}}>
        <Lucide name={icon} size={20} color={color} />
      </span>
    ) : (
      <Tile icon={icon} tone={tone} size="md" />
    )}
    <span style={{flex: 1, fontSize: 14, fontWeight: 700, color: C.ink}}>{name}</span>
    <span style={{display: 'grid', placeItems: 'center', width: 32, height: 32, borderRadius: '50%'}}>
      <Lucide name="pencil" size={16} color={C.inkSoft} />
    </span>
    <span style={{display: 'grid', placeItems: 'center', width: 32, height: 32, borderRadius: '50%'}}>
      <Lucide name="archive" size={16} color={C.inkSoft} />
    </span>
  </div>
);

const Card = ({title, children}: {title: string; children: React.ReactNode}) => (
  <div style={{...PANEL}}>
    <div style={{padding: '14px 16px 6px', fontSize: 15, fontWeight: 700, color: C.ink}}>{title}</div>
    <div style={{padding: '0 16px 10px'}}>{children}</div>
  </div>
);

export const Scene = () => {
  const f = useCurrentFrame();
  const phoneIn = usePhoneIn();
  const up = prog(f, SHEET_UP, 44, E.glide) * (1 - prog(f, SHEET_DOWN, 24, E.exit));
  const name = typed('Olahraga', f, NAME_AT, 12);
  const typingName = f >= NAME_AT && f < NAME_AT + 50;
  const slot = prog(f, ROW_AT - 6, 16, E.ui); // the new row's slot opens; its content arrives once half open
  const rowIn = prog(f, ROW_AT, 22, E.out);
  const gone = prog(f, ARCHIVED_AT, 18); // Hiburan leaves the Expenses list…
  const shelf = prog(f, ARCHIVED_AT + 10, 26, E.out); // …and lands on the Archived shelf
  const toast = prog(f, TOAST_AT, 22, E.out);
  // The preview at the top of the sheet: the tile as it will look in lists, updating as the fields change.
  const icon: IconName = f >= TAP_ICON ? ICON : 'tag';
  const colour = f >= COLOR_AT ? SWATCH : null;
  const tone = pop(autoTone(name));

  return (
    <AbsoluteFill>
      <Phone w={PHONE.w} h={PHONE.h} screen={C.surface} style={{left: PHONE.left, top: PHONE.top, borderRadius: 96, ...phoneIn}}>
        <div style={{position: 'absolute', left: 0, top: 0, width: APP_W, height: SCREEN_H, transformOrigin: 'top left', transform: `scale(${ZOOM})`, fontFamily: body, color: C.ink}}>
          <div style={{padding: '48px 16px 16px', display: 'grid', gap: 16}}>
            <PageHeader title="Categories" subtitle="Categories are archived, never deleted, so past transactions keep their meaning." action={<Button variant="primary" size="sm" icon="plus" style={{transform: `scale(${pressScale(f, TAP_NEW)})`}}>New category</Button>} />
            <Card title="Expenses">
              {EXPENSES.map((c) => (
                <div key={c.name} style={c.name === 'Hiburan' ? {height: 44 * (1 - gone), overflow: 'hidden'} : undefined}>
                  <Row {...c} fade={c.name === 'Hiburan' ? 1 - gone : 1} />
                </div>
              ))}
              {f >= ROW_AT - 6 && (
                <div style={{position: 'relative', height: 44 * slot}}>
                  {/* A 2 px accent line marks where the row goes in, then relaxes away. */}
                  <div style={{position: 'absolute', left: 0, right: 0, top: -1, height: 2, borderRadius: 1, background: C.accent, opacity: 1 - prog(f, ROW_AT, 24, E.smooth)}} />
                  <div style={{opacity: prog(f, ROW_AT, 10, E.smooth), transform: `translateY(${(1 - rowIn) * 12}px)`}}>
                    <Row name="Olahraga" icon={ICON} tone="sky" color={SWATCH} />
                  </div>
                </div>
              )}
            </Card>
            <Card title="Income">
              <Row name="Gaji" {...CATEGORY.Gaji} />
            </Card>
            {f >= ARCHIVED_AT + 10 && (
              <div style={{opacity: prog(f, ARCHIVED_AT + 10, 8), transform: `translateY(${(1 - shelf) * 30}px)`}}>
                <Card title="Archived">
                  <div style={{display: 'flex', alignItems: 'center', gap: 12, height: 44}}>
                    <Tile icon={CATEGORY.Hiburan.icon} tone={CATEGORY.Hiburan.tone} size="md" />
                    <span style={{flex: 1, fontSize: 14, fontWeight: 700}}>Hiburan</span>
                    <span style={{padding: '3px 10px', borderRadius: 999, background: C.sunken, fontSize: 12, fontWeight: 700, color: C.inkSoft}}>Archived</span>
                  </div>
                </Card>
              </div>
            )}
          </div>
          <TabBar active="" />
          {/* An old transaction, still filed under the archived name. */}
          {f >= TOAST_AT && (
            <div style={{position: 'absolute', left: 16, right: 16, bottom: 100, ...PANEL, borderRadius: 16, padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 12, opacity: prog(f, TOAST_AT, 8), transform: `translateY(${(1 - toast) * 40}px)`}}>
              <Tile icon={CATEGORY.Hiburan.icon} tone={CATEGORY.Hiburan.tone} size="sm" />
              <div style={{flex: 1, minWidth: 0}}>
                <div style={{fontSize: 14, fontWeight: 700}}>Bioskop</div>
                <div style={{fontSize: 12, color: C.inkSoft}}>
                  28 Sep 2026, <Marker at={MARK_AT} f={f} color={YELLOW_MARK}>Hiburan</Marker>
                </div>
              </div>
              <div style={{fontSize: 14, fontWeight: 800, color: C.expense, fontVariantNumeric: 'tabular-nums'}}>−Rp 60.000</div>
            </div>
          )}
          <div style={{position: 'absolute', inset: 0, background: `oklch(0 0 0 / ${(0.45 * up).toFixed(3)})`}} />
          <Sheet up={up} title="New category">
            <div style={{display: 'flex', alignItems: 'center', gap: 12, padding: 12, borderRadius: 24, background: C.sunken}}>
              <span style={{display: 'grid', placeItems: 'center', flex: 'none', width: 56, height: 56, borderRadius: 18, background: colour ? `color-mix(in oklab, ${colour} 16%, ${C.raised})` : tone.soft, transform: `scale(${1 + 0.08 * (glow(f, TAP_ICON) + glow(f, COLOR_AT))})`}}>
                <Lucide name={icon} size={24} color={colour ?? tone.strong} />
              </span>
              <div style={{minWidth: 0}}>
                <div style={{fontSize: 16, fontWeight: 800, color: name ? C.ink : C.inkFaint}}>{name || 'Category name'}</div>
                <div style={{fontSize: 12, fontWeight: 600, color: C.inkSoft}}>Expense</div>
              </div>
            </div>
            <Field label="Name" required>
              <Input value={name} placeholder="e.g. Groceries" focus={typingName ? 1 : 0} caret={typingName && caretOn(f)} fresh={newest('Olahraga', f, NAME_AT, 12)} />
            </Field>
            <Field label="Used for" required>
              <Chips options={[{label: 'Expenses', icon: 'arrowUpRight'}, {label: 'Income', icon: 'arrowDownLeft'}]} value={f >= USED_AT[0] ? 'Expenses' : undefined} lit={{Expenses: glow(f, USED_AT[0]), Income: glow(f, USED_AT[1])}} />
            </Field>
            <Field label="Icon">
              <IconGrid value={f >= TAP_ICON ? ICON : 'tag'} scroll={SCROLL_TO * prog(f, SCROLL_AT, 40, E.glide)} lit={glow(f, TAP_ICON)} />
            </Field>
            <Field label="Colour">
              <Colours value={colour} lit={{[SWATCH]: glow(f, COLOR_AT)}} />
            </Field>
            <div style={{display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 4}}>
              <Button variant="secondary">Cancel</Button>
              <Button variant="primary" style={{transform: `scale(${pressScale(f, TAP_SAVE)})`}}>Create category</Button>
            </div>
          </Sheet>
        </div>
      </Phone>
      <Tap f={f} at={TAP_NEW} x={NEW_BTN.x} y={NEW_BTN.y} w={140 * ZOOM} h={36 * ZOOM} />
      <Tap f={f} at={TAP_ICON} x={ICON_BTN.x} y={ICON_BTN.y} w={ICON_BOX.cell * ZOOM} h={ICON_BOX.cell * ZOOM} r={16 * ZOOM} />
      <Tap f={f} at={COLOR_AT} x={SKY_DOT.x} y={SKY_DOT.y} w={36 * ZOOM} h={36 * ZOOM} />
      <Tap f={f} at={TAP_SAVE} x={SAVE_BTN.x} y={SAVE_BTN.y} w={150 * ZOOM} h={44 * ZOOM} />
      <Tap f={f} at={TAP_ARCHIVE} x={ARCHIVE_BTN.x} y={ARCHIVE_BTN.y} w={32 * ZOOM} h={32 * ZOOM} />
    </AbsoluteFill>
  );
};
