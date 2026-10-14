// S5 — Step 3, Back Tap: iPhone Settings → Aksesibilitas → Sentuh → Ketuk Belakang → Ketuk Dua Kali → Arus.
// Each page pushes in from the right as its row is tapped; a breadcrumb builds above the phone.
import {Accessibility, Bell, Eye, Hand, Settings, Sun, Type} from 'lucide-react';
import type {LucideIcon} from 'lucide-react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {type CameraKey, type Cue, lerp, prog} from '../../lib/core';
import {Lucide} from '../../lib/lucide';
import {E, Tap, usePhoneIn} from '../../lib/motion';
import {C, body} from '../../lib/palette';
import {STAGE_ZOOM as Z, StagePhone, onStage} from '../../lib/Phone';
import {OS_BG, StepChip} from '../parts';
import {cue} from '../voice';

// VO: "Lalu di Pengaturan iPhone:" | "Aksesibilitas," | "Sentuh," | "Ketuk Belakang." | "Pilih Ketuk Dua Kali,"
//     | "dan pasang Shortcut-mu."
const TAPS = [cue('S5', 1, 0.05), cue('S5', 2, 0.05), cue('S5', 3, 0.1), cue('S5', 4, 0.25)];
const PUSH = 6; // a page pushes in this long after its row is tapped
const ARUS_AT = cue('S5', 5, 0.45);

type Row = {label: string; icon?: LucideIcon; hue?: number; value?: string; check?: boolean};
type Page = {title: string; back?: string; groups: {head?: string; rows: Row[]}[]};
const PAGES: Page[] = [
  {title: 'Pengaturan', groups: [{rows: [{label: 'Umum', icon: Settings, hue: 250}, {label: 'Aksesibilitas', icon: Accessibility, hue: 255}, {label: 'Layar & Kecerahan', icon: Sun, hue: 255}, {label: 'Pemberitahuan', icon: Bell, hue: 25}]}]},
  {title: 'Aksesibilitas', back: 'Pengaturan', groups: [{head: 'PENGLIHATAN', rows: [{label: 'Pembaca Layar', icon: Eye, hue: 255}, {label: 'Ukuran Teks', icon: Type, hue: 255}]}, {head: 'FISIK DAN MOTORIK', rows: [{label: 'Sentuh', icon: Hand, hue: 255}, {label: 'Kontrol Suara', icon: Bell, hue: 255}]}]},
  {title: 'Sentuh', back: 'Aksesibilitas', groups: [{rows: [{label: 'Sentuhan Bantu', value: 'Tidak Aktif'}, {label: 'Haptik', value: 'Aktif'}, {label: 'Ketuk untuk Membangunkan', value: 'Aktif'}, {label: 'Ketuk Belakang', value: 'Tidak Aktif'}]}]},
  {title: 'Ketuk Belakang', back: 'Sentuh', groups: [{rows: [{label: 'Ketuk Dua Kali', value: 'Tidak Ada'}, {label: 'Ketuk Tiga Kali', value: 'Tidak Ada'}]}]},
  {title: 'Ketuk Dua Kali', back: 'Ketuk Belakang', groups: [{head: 'SISTEM', rows: [{label: 'Tidak Ada', check: true}, {label: 'Pusat Kontrol'}, {label: 'Layar Utama'}]}, {head: 'PINTASAN', rows: [{label: 'Arus'}]}]},
];
// The row each tap lands on (page, group, row) and the breadcrumb word it adds.
const TAPPED = [
  {page: 0, g: 0, r: 1, crumb: 'Aksesibilitas'},
  {page: 1, g: 1, r: 0, crumb: 'Sentuh'},
  {page: 2, g: 0, r: 3, crumb: 'Ketuk Belakang'},
  {page: 3, g: 0, r: 0, crumb: 'Ketuk Dua Kali'},
];
const ROW = 48;
const GROUP_TOP = 150;
/** Centre y (app px) of a row: groups stack with a 26 px heading and a 16 px gap. */
const rowY = (page: number, g: number, r: number) => {
  let y = GROUP_TOP;
  for (let k = 0; k < g; k++) y += (PAGES[page].groups[k].head ? 26 : 0) + PAGES[page].groups[k].rows.length * ROW + 16;
  return y + (PAGES[page].groups[g].head ? 26 : 0) + r * ROW + ROW / 2;
};

export const camera: CameraKey[] = [{at: 0, zoom: 1.3, x: 540, y: onStage(0, 300).y, dur: 1}];

export const sfx: Cue[] = [
  ...TAPS.map((at) => ({at, sound: 'tap', volume: 0.6})),
  ...TAPS.map((at) => ({at: at + PUSH, sound: 'whoosh', volume: 0.2})),
  {at: ARUS_AT, sound: 'snap', volume: 0.6},
];

const PageView = ({page, arus}: {page: Page; arus: boolean}) => (
  <div style={{position: 'absolute', inset: 0, background: OS_BG, fontFamily: body, color: C.ink}}>
    {page.back && (
      <div style={{position: 'absolute', left: 8, top: 54, display: 'flex', alignItems: 'center', fontSize: 16, color: 'oklch(0.55 0.17 255)'}}>
        <Lucide name="chevronLeft" size={22} color="oklch(0.55 0.17 255)" strokeWidth={2.6} />
        {page.back}
      </div>
    )}
    <div style={{position: 'absolute', left: 18, top: 92, fontSize: 30, fontWeight: 800, letterSpacing: -0.5}}>{page.title}</div>
    <div style={{position: 'absolute', left: 14, right: 14, top: GROUP_TOP, display: 'grid', gap: 16}}>
      {page.groups.map((g, gi) => (
        <div key={gi}>
          {g.head && <div style={{height: 26, padding: '0 14px', fontSize: 12, color: C.inkFaint}}>{g.head}</div>}
          <div style={{borderRadius: 14, background: '#fff', overflow: 'hidden'}}>
            {g.rows.map((r, ri) => {
              const checked = page.title === 'Ketuk Dua Kali' ? (arus ? r.label === 'Arus' : !!r.check) : false;
              return (
                <div key={r.label} style={{display: 'flex', alignItems: 'center', gap: 12, height: ROW, padding: '0 14px', borderTop: ri ? '1px solid oklch(0.92 0.005 250)' : undefined, fontSize: 16}}>
                  {r.icon && (
                    <span style={{display: 'grid', placeItems: 'center', width: 28, height: 28, borderRadius: 7, background: `oklch(0.6 0.15 ${r.hue})`}}>
                      <r.icon size={16} color="#fff" strokeWidth={2.4} />
                    </span>
                  )}
                  <span style={{flex: 1}}>{r.label}</span>
                  {r.value && <span style={{color: C.inkFaint}}>{r.label === 'Ketuk Dua Kali' && arus ? 'Arus' : r.value}</span>}
                  {checked ? <Lucide name="check" size={18} color="oklch(0.55 0.17 255)" strokeWidth={3} /> : page.title !== 'Ketuk Dua Kali' && <Lucide name="chevronRight" size={16} color={C.inkFaint} />}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  </div>
);

export const Scene = () => {
  const f = useCurrentFrame();
  const phoneIn = usePhoneIn();
  const pushes = TAPS.map((at) => prog(f, at + PUSH, 26, E.glide));
  const arus = f >= ARUS_AT;
  return (
    <AbsoluteFill>
      <StepChip f={f} at={0} n={3} label="Ketuk Belakang" />
      {/* Breadcrumb: the path so far. */}
      <StagePhone screen={OS_BG} style={phoneIn}>
        {PAGES.map((page, i) => {
          const inP = i === 0 ? 1 : pushes[i - 1];
          const outP = i < pushes.length ? pushes[i] : 0;
          if (inP <= 0 || outP >= 1) return null;
          return (
            <div key={page.title} style={{position: 'absolute', inset: 0, transform: `translateX(${lerp(394, 0, inP) - 118 * outP}px)`, boxShadow: i ? '-10px 0 30px oklch(0 0 0 / 0.12)' : undefined}}>
              <PageView page={page} arus={arus} />
            </div>
          );
        })}
      </StagePhone>
      {/* Breadcrumb: the path so far, a caption over the empty lower half of the screen. */}
      <div style={{position: 'absolute', left: 250, right: 250, top: 1240, display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '4px 10px', padding: '14px 18px', borderRadius: 28, background: 'oklch(0.3 0.06 168 / 0.92)', fontFamily: body, fontSize: 30, fontWeight: 800, color: '#fff', opacity: prog(f, TAPS[0], 10, E.smooth)}}>
        {TAPPED.map((t, i) => (
          <span key={t.crumb} style={{opacity: prog(f, TAPS[i], 10, E.smooth), transform: `translateY(${(1 - prog(f, TAPS[i], 22, E.out)) * 12}px)`}}>
            {i > 0 && <span style={{color: C.highlight, marginRight: 10}}>›</span>}
            {t.crumb}
          </span>
        ))}
      </div>
      {TAPPED.map((t, i) => {
        const p = onStage(197, rowY(t.page, t.g, t.r));
        return <Tap key={t.crumb} f={f} at={TAPS[i]} x={p.x} y={p.y} w={366 * Z} h={ROW * Z} r={14 * Z} />;
      })}
      <Tap f={f} at={ARUS_AT} x={onStage(197, rowY(4, 1, 0)).x} y={onStage(197, rowY(4, 1, 0)).y} w={366 * Z} h={ROW * Z} r={14 * Z} />
    </AbsoluteFill>
  );
};
