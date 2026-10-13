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
