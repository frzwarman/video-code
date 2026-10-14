// S5 — Workspace: the Workspaces page. A shared workspace is created, someone is invited by email with a role,
// and the one-time link comes back: shown once, for that address only.
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import type {ReactNode} from 'react';
import {type CameraKey, type Cue, back, fadeUp, prog, spin} from '../../lib/core';
import {Marker, Ring, YELLOW_MARK} from '../../lib/Fx';
import {APP_W, TabBar} from '../../lib/Home';
import {Lucide, Tile, type IconName} from '../../lib/lucide';
import {C, body, type Tone} from '../../lib/palette';
import {Phone, bezel} from '../../lib/Phone';
import {Button, Field, Input, PANEL, PageHeader, Sheet, caretOn, typed} from '../../lib/ui';
import {cue} from '../voice';

// VO: "Mau berbagi?" | "Buat workspace bersama," | "undang lewat email," | "pilih perannya:" | "pemilik," | "editor,"
//     | "atau pembaca." | "Tautannya SEKALI pakai, hanya untuk alamat yang diundang."
const TAP_NEW = cue('S5', 1, 0.08);
const SHEET1_UP = TAP_NEW + 8;
const NAME_AT = cue('S5', 1, 0.3); // "Keluarga" is typed
const TAP_CREATE = cue('S5', 1, 0.7);
const SHEET1_DOWN = TAP_CREATE + 8;
const WS_AT = SHEET1_DOWN + 12; // Keluarga lands in the list and is the active workspace
const TAP_INVITE = cue('S5', 2, 0.35);
const SHEET2_UP = TAP_INVITE + 8;
const EMAIL_AT = cue('S5', 2, 0.6); // "rani@gmail.com" is typed
const ROLE_OPEN = cue('S5', 3, 0.3); // the role list opens
const ROLE_AT = [cue('S5', 4, 0.1), cue('S5', 5, 0.1), cue('S5', 6, 0.15)]; // Owner · Editor · Viewer, as the voice names them
const ROLE_CLOSE = cue('S5', 6, 1) + 4; // Editor stays
const TAP_SEND = cue('S5', 7, 0) + 2;
const LINK_AT = TAP_SEND + 10; // the form becomes the link
const ONCE_AT = cue('S5', 7, 0.28); // "SEKALI"
const ADDR_AT = cue('S5', 7, 0.72); // "alamat yang diundang"
const TAP_COPY = cue('S5', 7, 0.95);

const PHONE = {left: 240, top: 300, w: 600, h: 1300};
const BZ = bezel(PHONE.w, PHONE.h);
const ZOOM = BZ.screenW / APP_W;
const SCREEN_H = BZ.screenH / ZOOM;
const toScene = (x: number, y: number) => ({x: PHONE.left + BZ.inset + x * ZOOM, y: PHONE.top + BZ.inset + y * ZOOM});
const NEW_BTN = toScene(119, 152);
const CREATE_BTN = toScene(298, SCREEN_H - 50);
const INVITE_BTN = toScene(331, 400);
const SEND_BTN = toScene(296, SCREEN_H - 50);
const COPY_BTN = toScene(328, SCREEN_H - 110);
const glow = (f: number, at: number) => (f >= at ? Math.exp(-(f - at) / 12) : 0);

const ROLES = [
  {label: 'Owner', blurb: 'Full control, including members and invitations.'},
  {label: 'Editor', blurb: 'Can add and edit financial records.'},
  {label: 'Viewer', blurb: 'Read-only access to everything in the workspace.'},
];
const EMAIL = 'rani@gmail.com';

export const camera: CameraKey[] = [
  {at: 0, zoom: 1.2, x: 540, y: 620, dur: 1},
  {at: SHEET1_UP + 6, zoom: 1.5, x: 540, y: 1250, dur: 30},
  {at: SHEET1_DOWN, zoom: 1.3, x: 540, y: 800, dur: 30},
  {at: SHEET2_UP + 6, zoom: 1.45, x: 540, y: 1150, dur: 30},
  {at: LINK_AT, zoom: 1.55, x: 540, y: 1250, dur: 30},
];

export const sfx: Cue[] = [
  {at: TAP_NEW, sound: 'tap', volume: 0.8},
  {at: SHEET1_UP, sound: 'whoosh', volume: 0.35},
  ...[0, 1, 2, 3, 4, 5, 6, 7].map((i) => ({at: NAME_AT + Math.round(i * 3.75), sound: 'tick', volume: 0.3})),
  {at: TAP_CREATE, sound: 'tap', volume: 0.8},
  {at: SHEET1_DOWN, sound: 'whoosh', volume: 0.3},
  {at: WS_AT, sound: 'snap', volume: 0.7},
  {at: TAP_INVITE, sound: 'tap', volume: 0.8},
  {at: SHEET2_UP, sound: 'whoosh', volume: 0.35},
  ...[0, 2, 4, 6, 8, 10, 12].map((i) => ({at: EMAIL_AT + Math.round(i * 2.5), sound: 'tick', volume: 0.3})),
  {at: ROLE_OPEN, sound: 'click', volume: 0.5},
  ...ROLE_AT.map((at) => ({at, sound: 'tap', volume: 0.6})),
  {at: ROLE_CLOSE, sound: 'click', volume: 0.4},
  {at: TAP_SEND, sound: 'tap', volume: 0.8},
  {at: LINK_AT, sound: 'snap', volume: 0.7},
  {at: ONCE_AT, sound: 'click', volume: 0.6},
  {at: TAP_COPY, sound: 'tap', volume: 0.7},
  {at: TAP_COPY + 6, sound: 'ding', volume: 0.5},
];

const Card = ({title, description, action, children}: {title: string; description?: string; action?: ReactNode; children: ReactNode}) => (
  <div style={{...PANEL}}>
    <div style={{display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, padding: '14px 16px 4px'}}>
      <div style={{minWidth: 0}}>
        <div style={{fontSize: 15, fontWeight: 700, color: C.ink}}>{title}</div>
        {description && <div style={{marginTop: 2, fontSize: 12, color: C.inkSoft, lineHeight: 1.35}}>{description}</div>}
      </div>
      {action && <div style={{flex: 'none'}}>{action}</div>}
    </div>
    <div style={{padding: '4px 16px 10px'}}>{children}</div>
  </div>
);

const WsRow = ({icon, tone, name, sub, active, divider}: {icon: IconName; tone: Tone; name: string; sub: string; active: boolean; divider?: boolean}) => (
  <div style={{display: 'flex', alignItems: 'center', gap: 12, padding: '8px 0', borderTop: divider ? `1px solid ${C.line}` : undefined}}>
    <Tile icon={icon} tone={tone} size="md" />
    <div style={{minWidth: 0, flex: 1}}>
      <div style={{fontSize: 14, fontWeight: 700, color: C.ink}}>{name}</div>
      <div style={{fontSize: 12, color: C.inkSoft}}>{sub}</div>
    </div>
    {active ? (
      <span style={{display: 'inline-flex', alignItems: 'center', gap: 4, padding: '4px 10px', borderRadius: 999, background: C.accentSoft, color: C.accentInk, fontSize: 12, fontWeight: 700}}>
        <Lucide name="check" size={12} color={C.accentInk} strokeWidth={3} /> Active
      </span>
    ) : (
      <Button variant="secondary" size="sm">
        Switch
      </Button>
    )}
  </div>
);

const SelectBox = ({value, hint}: {value: string; hint?: string}) => (
  <>
    <div style={{display: 'flex', alignItems: 'center', height: 44, padding: '0 12px', borderRadius: 14, background: C.raised, border: `1px solid ${C.lineStrong}`, boxSizing: 'border-box', fontSize: 16, color: C.ink}}>
      <span style={{flex: 1}}>{value}</span>
      <Lucide name="chevronDown" size={16} color={C.inkFaint} />
    </div>
    {hint && <div style={{fontSize: 12, color: C.inkSoft}}>{hint}</div>}
  </>
);

export const Scene = () => {
  const f = useCurrentFrame();
  const phoneIn = prog(f, 0, 26);
  const up1 = prog(f, SHEET1_UP, 22) * (1 - prog(f, SHEET1_DOWN, 16));
  const up2 = prog(f, SHEET2_UP, 22);
  const up = Math.max(up1, up2);
  const name = typed('Keluarga', f, NAME_AT, 16);
  const typingName = f >= NAME_AT && f < NAME_AT + 40;
  const created = f >= WS_AT;
  const wsIn = prog(f, WS_AT, 24, back);
  const email = typed(EMAIL, f, EMAIL_AT, 24);
  const typingEmail = f >= EMAIL_AT && f < EMAIL_AT + 44;
  const listOpen = prog(f, ROLE_OPEN, 14) * (1 - prog(f, ROLE_CLOSE, 10));
  const linked = f >= LINK_AT;
  const linkIn = prog(f, LINK_AT, 14);
  const lockIn = prog(f, ONCE_AT, 20, back);
  const copiedAt = TAP_COPY + 6;

  return (
    <AbsoluteFill>
      <Phone w={PHONE.w} h={PHONE.h} screen={C.surface} style={{left: PHONE.left, top: PHONE.top, borderRadius: 96, ...fadeUp(phoneIn, 90)}}>
        <div style={{position: 'absolute', left: 0, top: 0, width: APP_W, height: SCREEN_H, transformOrigin: 'top left', transform: `scale(${ZOOM})`, fontFamily: body, color: C.ink}}>
          <div style={{padding: '48px 16px 16px', display: 'grid', gap: 16}}>
            <div>
              <PageHeader title="Workspaces" subtitle="A personal workspace is yours alone. Shared workspaces have members and roles." />
              <div style={{marginTop: 12}}>
                <Button variant="primary" size="sm" icon="plus">
                  New shared workspace
                </Button>
              </div>
            </div>
            <Card title="Your workspaces">
              <WsRow icon="house" tone="mint" name="Personal" sub="Personal, owner" active={!created} />
              {created && (
                <div style={{opacity: prog(f, WS_AT, 8), transform: `translateY(${(1 - wsIn) * 20}px) scale(${0.95 + 0.05 * wsIn})`}}>
                  <WsRow icon="users" tone="sky" name="Keluarga" sub="Shared, owner" active divider />
                </div>
              )}
            </Card>
            <Card
              title="Members"
              description={created ? 'Removing someone ends their access right away.' : 'Just you in here. Create a shared workspace to budget with someone else.'}
              action={
                created ? (
                  <Button variant="secondary" size="sm" icon="userPlus">
                    Invite
                  </Button>
                ) : undefined
              }
            >
              <div style={{display: 'flex', alignItems: 'center', gap: 12, padding: '8px 0'}}>
                <span style={{display: 'grid', placeItems: 'center', width: 44, height: 44, borderRadius: '50%', background: C.accentSoft, color: C.accentInk, fontSize: 14, fontWeight: 700, flex: 'none'}}>J</span>
                <div style={{minWidth: 0, flex: 1}}>
                  <div style={{fontSize: 14, fontWeight: 700, color: C.ink}}>
                    Jane <span style={{fontWeight: 500, color: C.inkSoft}}>(you)</span>
                  </div>
                  <div style={{fontSize: 12, color: C.inkSoft}}>jane@gmail.com</div>
                </div>
                {created && (
                  <span style={{display: 'inline-flex', alignItems: 'center', gap: 6, height: 36, padding: '0 12px', borderRadius: 12, border: `1px solid ${C.lineStrong}`, fontSize: 13, fontWeight: 600, color: C.ink, opacity: prog(f, WS_AT, 10)}}>
                    Owner <Lucide name="chevronDown" size={14} color={C.inkFaint} />
                  </span>
                )}
              </div>
            </Card>
          </div>
          <TabBar active="" />
          <div style={{position: 'absolute', inset: 0, background: `oklch(0 0 0 / ${(0.45 * up).toFixed(3)})`}} />
          {f < SHEET2_UP && (
            <Sheet up={up1} title="New shared workspace" description="You become its owner. Nobody else has access until you invite them.">
              <Field label="Name" required>
                <Input value={name} placeholder="Household" focus={typingName ? 1 : 0} caret={typingName && caretOn(f)} />
              </Field>
              <div style={{display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 4}}>
                <Button variant="secondary">Cancel</Button>
                <Button variant="primary">Create workspace</Button>
              </div>
            </Sheet>
          )}
          {f >= SHEET2_UP && (
            <Sheet up={up2} title="Invite someone" description="They must sign in with this exact Google address to join Keluarga.">
              {!linked ? (
                <>
                  <Field label="Email address" required>
                    <Input value={email} placeholder="name@example.com" focus={typingEmail ? 1 : 0} caret={typingEmail && caretOn(f)} />
                  </Field>
                  <Field label="Role">
                    <SelectBox value="Editor" hint={listOpen > 0 ? undefined : ROLES[1].blurb} />
                    {listOpen > 0 && (
                      <div style={{...PANEL, padding: 4, display: 'grid', opacity: listOpen, transform: `translateY(${(1 - listOpen) * -8}px)`}}>
                        {ROLES.map((r, i) => {
                          const hot = glow(f, ROLE_AT[i]);
                          return (
                            <div key={r.label} style={{display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', borderRadius: 12, background: `oklch(0.67 0.165 160 / ${(0.2 * hot).toFixed(3)})`, transform: `scale(${1 + 0.03 * hot})`}}>
                              <div style={{flex: 1}}>
                                <div style={{fontSize: 14, fontWeight: 700, color: C.ink}}>{r.label}</div>
                                <div style={{fontSize: 12, color: C.inkSoft}}>{r.blurb}</div>
                              </div>
                              {r.label === 'Editor' && <Lucide name="check" size={16} color={C.accentStrong} strokeWidth={2.8} />}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </Field>
                  <Field label="Link valid for">
                    <SelectBox value="7 days" hint="Between 1 and 14 days." />
                  </Field>
                  <div style={{display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 4}}>
                    <Button variant="secondary">Cancel</Button>
                    <Button variant="primary">Create invitation</Button>
                  </div>
                </>
              ) : (
                <div style={{display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: 16, opacity: linkIn, transform: `translateY(${(1 - linkIn) * 12}px)`}}>
                  <div style={{display: 'flex', alignItems: 'center', gap: 12, padding: 12, borderRadius: 16, background: C.accentSoft}}>
                    <span style={{display: 'grid', placeItems: 'center', width: 44, height: 44, borderRadius: 16, background: C.raised, flex: 'none'}}>
                      <Lucide name="mail" size={20} color={C.accentStrong} />
                    </span>
                    <div style={{fontSize: 13, color: C.ink, lineHeight: 1.4}}>
                      Send this link to{' '}
                      <Marker at={ADDR_AT} f={f} color={YELLOW_MARK}>
                        <span style={{fontWeight: 700}}>{EMAIL}</span>
                      </Marker>
                      . It is{' '}
                      <Marker at={ONCE_AT} f={f} color={YELLOW_MARK}>
                        shown once
                      </Marker>{' '}
                      and cannot be recovered, so reissue the invitation if it is lost.
                    </div>
                  </div>
                  <div style={{display: 'flex', gap: 8}}>
                    <div style={{position: 'relative', flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', height: 44, padding: '0 12px', borderRadius: 14, background: C.raised, border: `1px solid ${C.lineStrong}`, boxSizing: 'border-box', fontFamily: 'ui-monospace, Menlo, monospace', fontSize: 11, color: C.ink, whiteSpace: 'nowrap', overflow: 'hidden'}}>
                      arus-finance.farizz-a.workers.dev/invite/f8c2…
                      {/* One-time: the lock lands on the link as the voice says "sekali". */}
                      {f >= ONCE_AT && (
                        <span style={{position: 'absolute', top: -12, right: -8, display: 'grid', placeItems: 'center', width: 28, height: 28, borderRadius: '50%', background: C.accentStrong, boxShadow: '0 6px 14px -4px oklch(0.5 0.125 162 / 0.6)', opacity: prog(f, ONCE_AT, 8), transform: `scale(${0.6 + 0.4 * lockIn}) rotate(${spin(f, ONCE_AT, 24, -120)}deg)`}}>
                          <Lucide name="lock" size={14} color={C.onAccent} strokeWidth={2.6} />
                        </span>
                      )}
                    </div>
                    <Button variant="secondary" icon={f >= copiedAt ? 'check' : 'copy'}>
                      {f >= copiedAt ? 'Copied' : 'Copy'}
                    </Button>
                  </div>
                  <div style={{display: 'flex', justifyContent: 'flex-end'}}>
                    <Button variant="primary">Done</Button>
                  </div>
                </div>
              )}
            </Sheet>
          )}
        </div>
      </Phone>
      <Ring f={f} at={TAP_NEW} x={NEW_BTN.x} y={NEW_BTN.y} r0={16} r1={90} dur={22} color={C.accent} />
      <Ring f={f} at={TAP_CREATE} x={CREATE_BTN.x} y={CREATE_BTN.y} r0={16} r1={100} dur={22} color={C.accent} />
      <Ring f={f} at={TAP_INVITE} x={INVITE_BTN.x} y={INVITE_BTN.y} r0={14} r1={80} dur={22} color={C.accent} />
      <Ring f={f} at={TAP_SEND} x={SEND_BTN.x} y={SEND_BTN.y} r0={16} r1={100} dur={22} color={C.accent} />
      <Ring f={f} at={TAP_COPY} x={COPY_BTN.x} y={COPY_BTN.y} r0={14} r1={80} dur={22} color={C.accent} />
    </AbsoluteFill>
  );
};
