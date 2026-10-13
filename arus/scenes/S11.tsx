// S11 — The screenshot is read on the iPhone and only its text leaves. The image itself is never saved,
// never sent: once read, it dissolves.
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {type CameraKey, type Cue, cue, fadeUp, lerp, prog} from '../core';
import {Marker, ScanBeam} from '../Fx';
import {Logo} from '../Logo';
import {Phone, bezel} from '../Phone';
import {C, body, display} from '../palette';

// VO: "Screenshot struk dibaca di iPhone-mu SENDIRI." | "Gambarnya TIDAK PERNAH disimpan, apalagi dikirim."
const READ_AT = cue('S11', 0, 0.3); // lines get recognised one by one
const SEND_AT = cue('S11', 0, 0.85); // only the text travels out
const GONE_AT = cue('S11', 1, 0.3); // "…TIDAK PERNAH disimpan": the image dissolves
const CAPTION_AT = cue('S11', 1, 0.8);
const LINES = ['Rp 152.500', 'KEDAI KOPI', '07 Okt 2026'];
const PHONE = {left: 310, top: 420, w: 460, h: 940};
const lineY = (i: number) => PHONE.top + bezel(PHONE.w, PHONE.h).inset + 300 + i * 90; // centre of each line on the shot
const PILL_Y = 250; // where the text goes: Arus
const arrival = (i: number) => SEND_AT + i * 8 + 44;

export const camera: CameraKey[] = [
  {at: 0, zoom: 1.3, x: 540, y: 820, dur: 1},
  {at: READ_AT - 10, zoom: 1.45, x: 540, y: 740, dur: 30},
  {at: SEND_AT, zoom: 1, dur: 30},
  {at: GONE_AT - 6, zoom: 1.35, x: 540, y: 740, dur: 24},
  {at: GONE_AT + 40, zoom: 1, dur: 30},
];

export const sfx: Cue[] = [
  ...LINES.map((_, i) => ({at: READ_AT + i * 18, sound: 'tick', volume: 0.45})),
  {at: SEND_AT, sound: 'whoosh', volume: 0.4},
  {at: GONE_AT + 6, sound: 'whoosh', volume: 0.3},
];

export const Scene = () => {
  const f = useCurrentFrame();
  const phoneIn = prog(f, 0, 24);
  const gone = prog(f, GONE_AT, 26);
  const label = prog(f, GONE_AT + 18, 16);

  return (
    <AbsoluteFill>
      <Phone w={PHONE.w} h={PHONE.h} screen={C.sunken} style={{left: PHONE.left, top: PHONE.top, ...fadeUp(phoneIn, 80)}}>
        {/* The screenshot: read, then gone. */}
        <div style={{position: 'absolute', top: 160, left: 40, right: 40, height: 520, borderRadius: 28, background: 'oklch(0.97 0.005 175)', opacity: 1 - gone, transform: `scale(${1 - 0.12 * gone})`, filter: gone > 0 ? `blur(${gone * 14}px)` : undefined}}>
          {LINES.map((t, i) => {
            const read = prog(f, READ_AT + i * 18, 14);
            return (
              <div key={t} style={{position: 'absolute', top: 120 + i * 90, left: 36, height: 56, width: 280, borderRadius: 10, background: 'oklch(0.86 0.01 180)'}}>
                <div style={{position: 'absolute', inset: -6, borderRadius: 14, border: `4px solid ${C.accentStrong}`, opacity: read}} />
              </div>
            );
          })}
          <ScanBeam f={f} at={READ_AT - 6} dur={56} top={0} height={520} />
        </div>
        {/* What is left where the image was: nothing kept, nothing sent. */}
        <div style={{position: 'absolute', top: 300, left: 40, right: 40, textAlign: 'center', fontFamily: body, ...fadeUp(label, 16)}}>
          <svg width={96} height={96} viewBox="0 0 24 24" fill="none" stroke={C.inkSoft} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" style={{display: 'block', margin: '0 auto'}}>
            <rect x={3} y={5} width={18} height={14} rx={2} />
            <path d="M3 16l5-5 4 4 3-3 6 6" />
            <circle cx={16} cy={9} r={1.5} />
            <path d="M4 4l16 16" stroke={C.expense} strokeWidth={2.2} />
          </svg>
          <div style={{marginTop: 18, fontSize: 30, fontWeight: 800, color: C.ink}}>Tidak disimpan</div>
          <div style={{marginTop: 6, fontSize: 30, fontWeight: 800, color: C.ink}}>Tidak dikirim</div>
        </div>
      </Phone>
      {/* Only the recognised text travels out, to Arus. */}
      {LINES.map((t, i) => {
        const go = prog(f, SEND_AT + i * 8, 50);
        const shown = prog(f, READ_AT + i * 18 + 10, 14);
        return (
          <div
            key={t}
            style={{
              position: 'absolute',
              left: lerp(PHONE.left + 74, 420, go),
              top: lerp(lineY(i) - 28, PILL_Y + 24, go),
              fontFamily: 'ui-monospace, SF Mono, Menlo, monospace',
              fontWeight: 700,
              fontSize: 40,
              color: C.ink,
              padding: '6px 16px',
              borderRadius: 10,
              background: C.raised,
              opacity: shown * (1 - prog(f, SEND_AT + i * 8 + 30, 20)),
            }}
          >
            {t}
          </div>
        );
      })}
      {/* Only the text arrives here. */}
      <div
        style={{
          position: 'absolute',
          top: PILL_Y,
          left: '50%',
          display: 'flex',
          alignItems: 'center',
          gap: 18,
          padding: '14px 30px 14px 18px',
          borderRadius: 999,
          background: C.surface,
          border: `2px solid ${C.line}`,
          opacity: prog(f, SEND_AT - 14, 16),
          transform: `translateX(-50%) translateY(${(1 - prog(f, SEND_AT - 14, 16)) * -24}px) scale(${1 + 0.08 * LINES.reduce((s, _, i) => s + (f >= arrival(i) ? Math.exp(-(f - arrival(i)) / 5) : 0), 0)})`,
        }}
      >
        <Logo size={52} />
        <span style={{fontFamily: display, fontWeight: 700, fontSize: 40, color: C.ink}}>Arus</span>
      </div>
      <div style={{position: 'absolute', top: 1400, width: '100%', textAlign: 'center', fontFamily: body, fontWeight: 800, fontSize: 48, lineHeight: 1.25, color: C.onBand, ...fadeUp(prog(f, CAPTION_AT, 20))}}>
        <Marker at={CAPTION_AT + 12} f={f}>Hanya teksnya</Marker> yang dikirim.
        <br />
        Gambarnya tidak disimpan.
      </div>
    </AbsoluteFill>
  );
};
