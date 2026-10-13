import type {CSSProperties, ReactNode} from 'react';

// A plain phone body drawn in CSS: bezel, screen, island. No device brand marks.
export const Phone = ({
  w = 520,
  h = 1120,
  screen = '#000',
  style,
  children,
}: {
  w?: number;
  h?: number;
  screen?: string;
  style?: CSSProperties;
  children?: ReactNode;
}) => (
  <div
    style={{
      position: 'absolute',
      width: w,
      height: h,
      borderRadius: 88,
      background: 'oklch(0.12 0.01 180)',
      border: '3px solid oklch(0.32 0.02 180)',
      padding: 14,
      boxSizing: 'border-box',
      boxShadow: '0 60px 120px -40px oklch(0 0 0 / 0.8)',
      ...style,
    }}
  >
    <div style={{position: 'relative', width: '100%', height: '100%', borderRadius: 74, overflow: 'hidden', background: screen}}>
      {children}
      <div style={{position: 'absolute', top: 18, left: '50%', width: 150, height: 42, marginLeft: -75, borderRadius: 21, background: '#000'}} />
    </div>
  </div>
);
