// S3 — Step 1, the token: Settings → iPhone quick add. "Any account (Arus works it out)" is picked, Create token,
// and the card shows the values; the shared Shortcut already holds the URL and key, so only p_token is copied:
// it is shown once (a placeholder here, never a real one).
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {type CameraKey, type Cue, prog} from '../../lib/core';
import {Marker, YELLOW_MARK} from '../../lib/Fx';
import {Lucide} from '../../lib/lucide';
import {E, Tap, hitPulse, pressScale, punch, usePhoneIn} from '../../lib/motion';
import {C, body} from '../../lib/palette';
import {STAGE_ZOOM as Z, StagePhone, onStage} from '../../lib/Phone';
import {Button, PANEL, PageHeader} from '../../lib/ui';
import {StepChip} from '../parts';
import {cue} from '../voice';

// VO: "Pertama, buka Pengaturan," | "lalu iPhone quick add." | "Pilih Akun apa saja, biar Arus yang menentukan,"
//     | "lalu Buat token." | "Token hanya tampil SEKALI," | "jadi langsung SALIN."
const SCROLL_AT = cue('S3', 1, 0.1);
const OPEN_AT = cue('S3', 2, 0.05);
const ANY_AT = cue('S3', 2, 0.3);
const PICK_AT = cue('S3', 2, 0.8);
const CREATE_AT = cue('S3', 3, 0.3);
const RESULT_AT = CREATE_AT + 10;
const TOKEN_AT = cue('S3', 4, 0.05); // the p_token field lights…
const MARK_AT = cue('S3', 4, 0.45); // …"SEKALI" marks "shown once"…
const COPY_AT = cue('S3', 5, 0.45); // …and "SALIN" copies it

const SCROLL = 132;
const T = 224 - SCROLL; // the card's top once scrolled (app px)
const SELECT = {x: 197, y: T + 172};
const ANY_ITEM = {x: 197, y: T + 222};
const CREATE = {x: 16 + 16 + 70, y: T + 228};
const FIELD_Y = (i: number) => T + 214 + i * 76; // centre of field i's input
const COPY_BTN = {x: 394 - 32 - 22, y: FIELD_Y(2)};
const ACCOUNTS = ['Any account (Arus works it out)', 'Tunai', 'BCA', 'E-wallet'];
const VALUES = [
  ['URL', 'https://••••.supabase.co/rest/v1/rpc/quick_add'],
  ['apikey header', 'sb_publishable_••••••••••'],
  ['p_token', '9f3c1a••••••••••••••••••••'],
];
const s = (p: {x: number; y: number}) => onStage(p.x, p.y);

export const camera: CameraKey[] = [
  {at: 0, zoom: 1.2, x: 540, y: 760, dur: 1},
  {at: SCROLL_AT, zoom: 1.4, x: 540, y: s({x: 0, y: T + 160}).y},
  // "Buat token": hard cut in on the button as it is pressed, then out to the three values.
  ...punch(CREATE_AT - 2, s(CREATE).x, s(CREATE).y, {zoom: 1.4, x: 540, y: s({x: 0, y: T + 250}).y}, 2.2, 24),
  {at: TOKEN_AT - 8, zoom: 1.6, x: 540, y: s({x: 0, y: FIELD_Y(2)}).y},
];

export const sfx: Cue[] = [
  {at: SCROLL_AT, sound: 'whoosh', volume: 0.25},
  {at: OPEN_AT, sound: 'tap', volume: 0.6},
  {at: PICK_AT, sound: 'tap', volume: 0.7},
  {at: CREATE_AT, sound: 'tap', volume: 0.8},
  {at: RESULT_AT, sound: 'snap', volume: 0.6},
  {at: TOKEN_AT, sound: 'click', volume: 0.4},
  {at: COPY_AT, sound: 'click', volume: 0.6},
];

const Select = ({value, open}: {value?: string; open: boolean}) => (
  <div style={{display: 'flex', alignItems: 'center', height: 44, padding: '0 12px', borderRadius: 14, background: C.raised, border: `1px solid ${open ? C.accent : C.lineStrong}`, boxSizing: 'border-box', fontSize: 15, color: value ? C.ink : C.inkFaint}}>
    <span style={{flex: 1, whiteSpace: 'nowrap', overflow: 'hidden'}}>{value ?? 'Choose an account'}</span>
    <Lucide name="chevronDown" size={16} color={C.inkFaint} />
  </div>
);

export const Scene = () => {
  const f = useCurrentFrame();
  const phoneIn = usePhoneIn();
  const scroll = SCROLL * prog(f, SCROLL_AT, 34, E.glide);
  const open = prog(f, OPEN_AT, 14, E.out) * (1 - prog(f, PICK_AT + 4, 10, E.smooth));
  const picked = f >= PICK_AT;
  const result = f >= RESULT_AT;
  const arrive = (at: number) => ({opacity: prog(f, at, 10, E.smooth), transform: `translateY(${(1 - prog(f, at, 22, E.out)) * 14}px)`});
  return (
    <AbsoluteFill>
      <StepChip f={f} at={4} n={1} label="Token" />
      <StagePhone screen={C.surface} style={phoneIn}>
        <div style={{position: 'absolute', inset: 0, fontFamily: body, color: C.ink, transform: `translateY(${-scroll}px)`}}>
          <div style={{padding: '48px 16px 16px', display: 'grid', gap: 16}}>
            <PageHeader title="Settings" />
            <div style={{...PANEL, padding: 16, height: 112, boxSizing: 'border-box', display: 'flex', alignItems: 'center', gap: 16}}>
              <span style={{display: 'grid', placeItems: 'center', width: 64, height: 64, borderRadius: '50%', background: C.accentSoft, color: C.accentInk, fontSize: 22, fontWeight: 800}}>J</span>
              <div>
                <div style={{fontSize: 18, fontWeight: 800}}>Jane</div>
                <div style={{fontSize: 13, color: C.inkSoft}}>jane@gmail.com</div>
              </div>
            </div>
            {/* The iPhone quick add card (SettingsPage.tsx → QuickAddCard). */}
            <div style={{...PANEL, padding: 16, display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: 12, minHeight: 280}}>
              <div>
                <div style={{fontSize: 15, fontWeight: 700}}>iPhone quick add</div>
                <div style={{marginTop: 4, fontSize: 13, lineHeight: 1.35, color: C.inkSoft}}>Log a payment from a bank screenshot with an iOS Shortcut. An any-account token learns which account each bank&apos;s receipt belongs to; a single-account token always adds to its one account.</div>
              </div>
              {!result ? (
                <div style={{display: 'grid', gap: 12, opacity: 1 - prog(f, CREATE_AT + 2, 8, E.smooth)}}>
                  <div style={{display: 'grid', gap: 6}}>
                    <div style={{fontSize: 14, fontWeight: 600}}>Account</div>
                    <Select value={picked ? ACCOUNTS[0] : undefined} open={open > 0.01} />
                  </div>
                  <div>
                    <Button variant="primary" icon="smartphone" style={{transform: `scale(${pressScale(f, CREATE_AT)})`, opacity: picked ? 1 : 0.5}}>
                      Create token
                    </Button>
                  </div>
                </div>
              ) : (
                <div style={{display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: 8}}>
                  <div style={{fontSize: 13, lineHeight: 1.4, color: C.inkSoft, ...arrive(RESULT_AT)}}>
                    Paste these into your Shortcut. The token is{' '}
                    <Marker at={MARK_AT} f={f} color={YELLOW_MARK}>
                      shown once
                    </Marker>
                    , so create a new one if it is lost.
                  </div>
                  {VALUES.map(([label, value], i) => {
                    const lit = i === 2 ? hitPulse(f, TOKEN_AT, 3, 14) : 0;
                    const copied = i === 2 && f >= COPY_AT + 4;
                    return (
                      <div key={label} style={{display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: 6, ...arrive(RESULT_AT + 6 + i * 4)}}>
                        <div style={{fontSize: 14, fontWeight: 600}}>{label}</div>
                        <div style={{display: 'flex', gap: 8}}>
                          <div style={{flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', height: 44, padding: '0 12px', borderRadius: 14, border: `1px solid ${C.lineStrong}`, boxSizing: 'border-box', fontFamily: 'ui-monospace, Menlo, monospace', fontSize: 12, whiteSpace: 'nowrap', overflow: 'hidden', outline: lit > 0.02 ? `2px solid oklch(0.67 0.165 160 / ${lit.toFixed(3)})` : undefined, outlineOffset: 2}}>{value}</div>
                          <span style={{display: 'grid', placeItems: 'center', width: 44, height: 44, borderRadius: 14, border: `1px solid ${C.lineStrong}`, boxSizing: 'border-box', background: copied ? C.accentSoft : C.raised, transform: `scale(${i === 2 ? pressScale(f, COPY_AT) : 1})`}}>
                            <Lucide name={copied ? 'check' : 'copy'} size={16} color={copied ? C.accentStrong : C.inkSoft} strokeWidth={2.4} />
                          </span>
                        </div>
                      </div>
                    );
                  })}
                  <div style={{display: 'flex', justifyContent: 'flex-end', ...arrive(RESULT_AT + 20)}}>
                    <Button variant="primary">Done</Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        {/* The account list, dropping from the select. */}
        {open > 0.01 && (
          <div style={{position: 'absolute', left: 32, right: 32, top: SELECT.y + 26, ...PANEL, borderRadius: 16, padding: 4, fontFamily: body, opacity: open, transform: `translateY(${(1 - open) * -8}px)`}}>
            {ACCOUNTS.map((a, i) => (
              <div key={a} style={{display: 'flex', alignItems: 'center', height: 42, padding: '0 12px', borderRadius: 12, fontSize: 14, fontWeight: i === 0 ? 700 : 500, color: C.ink, background: i === 0 ? `oklch(0.67 0.165 160 / ${(0.22 * Math.max(hitPulse(f, ANY_AT, 3, 14), f >= PICK_AT ? 1 : 0)).toFixed(3)})` : undefined}}>
                {a}
              </div>
            ))}
          </div>
        )}
      </StagePhone>
      <Tap f={f} at={OPEN_AT} x={s(SELECT).x} y={s(SELECT).y} w={330 * Z} h={44 * Z} r={14 * Z} />
      <Tap f={f} at={PICK_AT} x={s(ANY_ITEM).x} y={s(ANY_ITEM).y} w={322 * Z} h={42 * Z} r={12 * Z} />
      <Tap f={f} at={CREATE_AT} x={s(CREATE).x} y={s(CREATE).y} w={140 * Z} h={44 * Z} />
      <Tap f={f} at={COPY_AT} x={s(COPY_BTN).x} y={s(COPY_BTN).y} w={44 * Z} h={44 * Z} r={14 * Z} />
    </AbsoluteFill>
  );
};
