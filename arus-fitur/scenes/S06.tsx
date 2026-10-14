// S6 — Foto profil: Settings → profile. A photo is picked, Arus crops the centre square and stores it small;
// it shows in the profile ring right away, then on Home, over the wave mark.
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import type {CSSProperties} from 'react';
import {type CameraKey, type Cue, inOut, lerp, prog} from '../../lib/core';
import {E, Tap, hitPulse, pressScale, punch, usePhoneIn} from '../../lib/motion';
import {APP_W, HOME, Home, TabBar} from '../../lib/Home';
import {Lucide} from '../../lib/lucide';
import {C, body} from '../../lib/palette';
import {Phone, bezel} from '../../lib/Phone';
import {Button, Field, Input, PANEL, PageHeader} from '../../lib/ui';
import {cue} from '../voice';

// VO: "Terakhir, bikin jadi MILIKMU." | "Unggah foto profil:" | "Arus memotongnya jadi persegi dan menyimpannya kecil."
//     | "Langsung tampil di profilmu."
const TAP_PHOTO = cue('S6', 1, 0.35);
const PICKER_UP = TAP_PHOTO + 8;
const TAP_PICK = cue('S6', 1, 1) + 6;
const PICKER_DOWN = TAP_PICK + 8;
const PHOTO_AT = PICKER_DOWN + 10; // the picked photo floats over the page
const CROP_AT = cue('S6', 2, 0.3); // "persegi": the centre square is marked
const SHRINK_AT = cue('S6', 2, 0.68); // "menyimpannya kecil": it shrinks into the ring
const ARRIVE = SHRINK_AT + 30;
const TOAST_AT = ARRIVE + 8;
const HOME_AT = cue('S6', 3); // "Langsung tampil di profilmu": Home is tapped, and your picture is on it

const PHONE = {left: 240, top: 300, w: 600, h: 1300};
const BZ = bezel(PHONE.w, PHONE.h);
const ZOOM = BZ.screenW / APP_W;
const SCREEN_H = BZ.screenH / ZOOM;
const toScene = (x: number, y: number) => ({x: PHONE.left + BZ.inset + x * ZOOM, y: PHONE.top + BZ.inset + y * ZOOM});
// App px: the avatar's centre and inner radius, the floating photo, its centre square, the picker tile, the Me tab.
const AVATAR = {x: 75, y: 158, r: 37};
const CARD = {x: 47, y: 420, w: 300, h: 200};
const SQ = {x: CARD.x + 50, y: CARD.y, s: 200};
const TILE = 129;
const PICKER_H = 44 + TILE * 2 + 3 + 28;
const PHOTO_BTN = toScene(181, 186);
const PICK = toScene(197, SCREEN_H - PICKER_H + 44 + TILE + 3 + TILE / 2);
const HOME_TAB = toScene(46, SCREEN_H - 62);
const HOME_AVATAR = toScene(HOME.avatar.x, HOME.avatar.y);
const CROP_MID = toScene(SQ.x + SQ.s / 2, SQ.y + SQ.s / 2);

export const camera: CameraKey[] = [
  {at: 0, zoom: 1.3, x: 540, y: 560, dur: 1},
  {at: PICKER_UP + 6, zoom: 1.35, x: 540, y: 1250},
  {at: PHOTO_AT, zoom: 1.3, x: 540, y: 900},
  // "persegi": hard cut in on the square as it is framed, back out before it shrinks into the ring.
  ...punch(CROP_AT - 2, CROP_MID.x, CROP_MID.y, {zoom: 1.3, x: 540, y: 900}, 2, 36),
  {at: HOME_AT + 8, zoom: 1.8, x: HOME_AVATAR.x, y: HOME_AVATAR.y + 60},
];

export const sfx: Cue[] = [
  {at: TAP_PHOTO, sound: 'tap', volume: 0.8},
  {at: PICKER_UP, sound: 'whoosh', volume: 0.35},
  {at: TAP_PICK, sound: 'tap', volume: 0.7},
  {at: PICKER_DOWN, sound: 'whoosh', volume: 0.3},
  {at: PHOTO_AT, sound: 'snap', volume: 0.5},
  {at: CROP_AT, sound: 'click', volume: 0.5},
  {at: SHRINK_AT, sound: 'whoosh', volume: 0.35},
  {at: ARRIVE, sound: 'snap', volume: 0.7},
  {at: TOAST_AT, sound: 'ding', volume: 0.5},
  {at: HOME_AT, sound: 'tap', volume: 0.7},
];

// A neutral picture, not a person: sky, sun, two hills. Sized in % so it reads the same at every scale.
const Photo = ({w, h, hue = 0, style}: {w: number; h: number; hue?: number; style?: CSSProperties}) => (
  <div style={{position: 'relative', width: w, height: h, overflow: 'hidden', background: 'linear-gradient(180deg, #ffd9a8 0%, #ff9d78 56%, #7fd6c2 56.5%)', filter: hue ? `hue-rotate(${hue}deg)` : undefined, ...style}}>
    <div style={{position: 'absolute', left: '58%', top: '20%', width: '26%', paddingTop: '26%', borderRadius: '50%', background: '#fff4c9'}} />
    <div style={{position: 'absolute', left: '-20%', top: '54%', width: '80%', height: '70%', borderRadius: '50%', background: '#2f9e7f'}} />
    <div style={{position: 'absolute', left: '40%', top: '62%', width: '90%', height: '70%', borderRadius: '50%', background: '#1f7a62'}} />
  </div>
);

export const Scene = () => {
  const f = useCurrentFrame();
  const phoneIn = usePhoneIn();
  const picker = prog(f, PICKER_UP, 44, E.glide) * (1 - prog(f, PICKER_DOWN, 24, E.exit));
  const photoIn = prog(f, PHOTO_AT, 26, E.out);
  const crop = prog(f, CROP_AT, 20);
  const fly = prog(f, SHRINK_AT, 30, inOut);
  const landed = f >= ARRIVE;
  const S = lerp(SQ.s, AVATAR.r * 2, fly);
  const sx = lerp(SQ.x, AVATAR.x - AVATAR.r, fly);
  const sy = lerp(SQ.y, AVATAR.y - AVATAR.r, fly);
  const toast = prog(f, TOAST_AT, 22, E.out);
  const home = prog(f, HOME_AT + 2, 16);

  return (
    <AbsoluteFill>
      <Phone w={PHONE.w} h={PHONE.h} screen={C.surface} variant="android" style={{left: PHONE.left, top: PHONE.top, borderRadius: 96, ...phoneIn}}>
        <div style={{position: 'absolute', left: 0, top: 0, width: APP_W, height: SCREEN_H, transformOrigin: 'top left', transform: `scale(${ZOOM})`, fontFamily: body, color: C.ink}}>
          <div style={{padding: '48px 16px 16px', display: 'grid', gap: 16}}>
            <PageHeader title="Settings" />
            <div style={{...PANEL, padding: 16}}>
              <div style={{display: 'flex', alignItems: 'center', gap: 16}}>
                {/* Jade ring around the photo: the profile-page look. */}
                <span style={{flex: 'none', width: 86, height: 86, borderRadius: '50%', padding: 3, boxSizing: 'border-box', background: C.brandTile, transform: `scale(${1 + 0.06 * hitPulse(f, ARRIVE, 3, 10)})`}}>
                  <span style={{position: 'relative', display: 'grid', placeItems: 'center', width: 80, height: 80, borderRadius: '50%', border: `3px solid ${C.raised}`, boxSizing: 'border-box', overflow: 'hidden', background: C.accentSoft, color: C.accentInk, fontSize: 24, fontWeight: 800}}>
                    J{landed && <Photo w={111} h={74} style={{position: 'absolute', left: -18.5, top: 0, opacity: prog(f, ARRIVE, 6)}} />}
                  </span>
                </span>
                <div style={{minWidth: 0, flex: 1}}>
                  <div style={{fontSize: 20, fontWeight: 800, color: C.ink, lineHeight: 1.15}}>Jane</div>
                  <div style={{marginTop: 2, fontSize: 14, color: C.inkSoft}}>jane@gmail.com</div>
                  <div style={{marginTop: 12, display: 'flex', alignItems: 'center', gap: 4}}>
                    <Button variant="secondary" size="sm" icon="camera" style={{transform: `scale(${pressScale(f, TAP_PHOTO)})`}}>
                      Photo
                    </Button>
                    {landed && (
                      <span style={{display: 'grid', placeItems: 'center', width: 36, height: 36, opacity: prog(f, ARRIVE, 10)}}>
                        <Lucide name="trash" size={16} color={C.inkSoft} />
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div style={{marginTop: 16, paddingTop: 16, borderTop: `1px solid ${C.line}`, display: 'flex', alignItems: 'flex-end', gap: 8}}>
                <div style={{flex: 1, minWidth: 0}}>
                  <Field label="Display name">
                    <Input value="Jane" />
                  </Field>
                </div>
                <Button variant="primary">Save</Button>
              </div>
            </div>
          </div>
          {f >= HOME_AT && (
            <div style={{position: 'absolute', inset: 0, overflow: 'hidden', background: C.surface, opacity: home, transform: `translateY(${(1 - home) * 24}px)`}}>
              <Home f={f} avatar={<Photo w={96} h={64} style={{position: 'absolute', left: -16, top: 0}} />} />
            </div>
          )}
          <TabBar active={f >= HOME_AT ? 'Home' : 'Me'} avatar={landed ? <Photo w={36} h={24} style={{position: 'absolute', left: -6, top: 0}} /> : undefined} />
          {/* The picked photo, floating over the page; then the centre square is marked. */}
          {f >= PHOTO_AT && f < SHRINK_AT + 10 && (
            <div style={{position: 'absolute', left: CARD.x, top: CARD.y, width: CARD.w, height: CARD.h, borderRadius: 16, overflow: 'hidden', boxShadow: '0 30px 60px -24px oklch(0.3 0.06 168 / 0.55)', opacity: prog(f, PHOTO_AT, 8) * (1 - prog(f, SHRINK_AT, 10)), transform: `scale(${0.8 + 0.2 * photoIn})`}}>
              <Photo w={CARD.w} h={CARD.h} />
              <div style={{position: 'absolute', top: 0, bottom: 0, left: 0, width: 50, background: `oklch(0 0 0 / ${(0.5 * crop).toFixed(3)})`}} />
              <div style={{position: 'absolute', top: 0, bottom: 0, right: 0, width: 50, background: `oklch(0 0 0 / ${(0.5 * crop).toFixed(3)})`}} />
              <div style={{position: 'absolute', left: 50, top: 0, width: SQ.s, height: SQ.s, boxSizing: 'border-box', border: `2px solid ${C.raised}`, opacity: crop, transform: `scale(${1.08 - 0.08 * crop})`}} />
            </div>
          )}
          {/* What Arus keeps: the square, shrinking into the ring. */}
          {f >= SHRINK_AT && !landed && (
            <>
              <div style={{position: 'absolute', left: sx, top: sy, width: S, height: S, borderRadius: lerp(12, S / 2, fly), overflow: 'hidden', boxShadow: '0 20px 40px -20px oklch(0.3 0.06 168 / 0.5)'}}>
                <Photo w={S * 1.5} h={S} style={{position: 'absolute', left: -S * 0.25, top: 0}} />
              </div>
              <div style={{position: 'absolute', left: sx + S + 8, top: sy + S - 26, ...PANEL, borderRadius: 999, padding: '4px 10px', fontSize: 11, fontWeight: 700, color: C.inkSoft, whiteSpace: 'nowrap', opacity: prog(f, SHRINK_AT + 4, 8) * (1 - prog(f, ARRIVE - 8, 6))}}>128 × 128 · JPEG</div>
            </>
          )}
          {f >= TOAST_AT && (
            <div style={{position: 'absolute', left: 16, right: 16, bottom: 100, ...PANEL, borderRadius: 16, padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 12, opacity: prog(f, TOAST_AT, 8) * (1 - prog(f, HOME_AT, 8)), transform: `translateY(${(1 - toast) * 40}px)`}}>
              <span style={{display: 'grid', placeItems: 'center', width: 32, height: 32, borderRadius: '50%', background: C.incomeSoft}}>
                <Lucide name="circleCheck" size={18} color={C.income} />
              </span>
              <div style={{fontSize: 14, fontWeight: 700}}>Photo updated</div>
            </div>
          )}
          {/* The system photo picker. */}
          <div style={{position: 'absolute', inset: 0, background: `oklch(0 0 0 / ${(0.4 * picker).toFixed(3)})`}} />
          <div style={{position: 'absolute', left: 0, right: 0, bottom: 0, height: PICKER_H, borderRadius: '20px 20px 0 0', background: C.raised, transform: `translateY(${(1 - picker) * 100}%)`, overflow: 'hidden'}}>
            <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 44, padding: '0 16px', fontSize: 15}}>
              <span style={{color: C.accentStrong, fontWeight: 600}}>Cancel</span>
              <span style={{fontWeight: 700, color: C.ink}}>Photos</span>
              <span style={{color: C.inkFaint, fontWeight: 600}}>Add</span>
            </div>
            <div style={{display: 'grid', gridTemplateColumns: `repeat(3, ${TILE}px)`, gap: 3}}>
              {[-40, 25, 70, 150, 0, 200].map((hue, i) => (
                <div key={i} style={{position: 'relative', width: TILE, height: TILE, overflow: 'hidden'}}>
                  <Photo w={TILE * 1.5} h={TILE} hue={hue} style={{marginLeft: -TILE * 0.25}} />
                  {i === 4 && <div style={{position: 'absolute', inset: 0, border: `4px solid ${C.accentStrong}`, boxSizing: 'border-box', opacity: prog(f, TAP_PICK, 6)}} />}
                </div>
              ))}
            </div>
          </div>
        </div>
      </Phone>
      <Tap f={f} at={TAP_PHOTO} x={PHOTO_BTN.x} y={PHOTO_BTN.y} w={100 * ZOOM} h={36 * ZOOM} />
      <Tap f={f} at={TAP_PICK} x={PICK.x} y={PICK.y} w={TILE * ZOOM} h={TILE * ZOOM} r={0} />
      <Tap f={f} at={HOME_AT} x={HOME_TAB.x} y={HOME_TAB.y} w={56 * ZOOM} h={32 * ZOOM} />
    </AbsoluteFill>
  );
};
