import type {CSSProperties, ReactNode} from 'react';

/** Bezel geometry for a phone of size w×h: padding, the screen's inset from the outer edge, screen size. */
export const bezel = (w: number, h: number) => {
  const pad = Math.round(w * 0.027);
  const inset = pad + 3;
  return {pad, inset, screenW: w - 2 * inset, screenH: h - 2 * inset};
};

// A plain phone body drawn in CSS. No device brand marks: the iOS-style one has an island, the
// Android-style one a punch-hole camera, flatter corners and a gesture bar. Both scale with the width.
export const Phone = ({
  w = 520,
  h = 1120,
  screen = '#000',
  variant = 'ios',
  style,
  children,
}: {
  w?: number;
  h?: number;
  screen?: string;
  variant?: 'ios' | 'android';
  style?: CSSProperties;
  children?: ReactNode;
}) => {
  const android = variant === 'android';
  const {pad} = bezel(w, h);
  return (
    <div
      style={{
        position: 'absolute',
        width: w,
        height: h,
        borderRadius: android ? w * 0.13 : w * 0.17,
        background: android ? 'oklch(0.15 0.008 260)' : 'oklch(0.12 0.01 180)',
        border: `3px solid ${android ? 'oklch(0.34 0.012 260)' : 'oklch(0.32 0.02 180)'}`,
        padding: pad,
        boxSizing: 'border-box',
        boxShadow: '0 60px 120px -40px oklch(0 0 0 / 0.8)',
        ...style,
      }}
    >
      <div style={{position: 'relative', width: '100%', height: '100%', borderRadius: android ? w * 0.1 : w * 0.142, overflow: 'hidden', background: screen}}>
        {children}
        {android ? (
          <>
            <div style={{position: 'absolute', top: w * 0.03, left: '50%', width: w * 0.043, height: w * 0.043, marginLeft: -w * 0.0215, borderRadius: '50%', background: '#000', boxShadow: '0 0 0 2px oklch(0.25 0.01 260)'}} />
            <div style={{position: 'absolute', bottom: w * 0.022, left: '50%', width: w * 0.28, height: w * 0.013, marginLeft: -w * 0.14, borderRadius: 3, background: 'oklch(1 0 0 / 0.55)'}} />
          </>
        ) : (
          <div style={{position: 'absolute', top: w * 0.035, left: '50%', width: w * 0.29, height: w * 0.081, marginLeft: -w * 0.145, borderRadius: w * 0.04, background: '#000'}} />
        )}
      </div>
    </div>
  );
};

// The stage phone: one size and place shared by every phone scene, so relay cuts land on the same pixels.
// Screens are drawn at app px (394 wide, Home.tsx's APP_W) and scaled into it.
export const STAGE = {left: 240, top: 300, w: 600, h: 1300};
const SBZ = bezel(STAGE.w, STAGE.h);
export const STAGE_ZOOM = SBZ.screenW / 394;
export const STAGE_SCREEN_H = SBZ.screenH / STAGE_ZOOM; // app px
/** App px on the stage phone's screen → scene px. */
export const onStage = (x: number, y: number) => ({x: STAGE.left + SBZ.inset + x * STAGE_ZOOM, y: STAGE.top + SBZ.inset + y * STAGE_ZOOM});
/** The stage phone with its screen content laid out in app px. */
export const StagePhone = ({screen, variant, style, children}: {screen: string; variant?: 'ios' | 'android'; style?: CSSProperties; children?: ReactNode}) => (
  <Phone w={STAGE.w} h={STAGE.h} screen={screen} variant={variant} style={{left: STAGE.left, top: STAGE.top, borderRadius: 96, ...style}}>
    <div style={{position: 'absolute', left: 0, top: 0, width: 394, height: STAGE_SCREEN_H, transformOrigin: 'top left', transform: `scale(${STAGE_ZOOM})`}}>{children}</div>
  </Phone>
);
