import type {CSSProperties, ReactNode} from 'react';

// A plain phone body drawn in CSS. No device brand marks: the iOS-style one has an island, the
// Android-style one a punch-hole camera, flatter corners and a gesture bar.
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
  return (
    <div
      style={{
        position: 'absolute',
        width: w,
        height: h,
        borderRadius: android ? 60 : 88,
        background: android ? 'oklch(0.15 0.008 260)' : 'oklch(0.12 0.01 180)',
        border: `3px solid ${android ? 'oklch(0.34 0.012 260)' : 'oklch(0.32 0.02 180)'}`,
        padding: 14,
        boxSizing: 'border-box',
        boxShadow: '0 60px 120px -40px oklch(0 0 0 / 0.8)',
        ...style,
      }}
    >
      <div style={{position: 'relative', width: '100%', height: '100%', borderRadius: android ? 46 : 74, overflow: 'hidden', background: screen}}>
        {children}
        {android ? (
          <>
            <div style={{position: 'absolute', top: 14, left: '50%', width: 20, height: 20, marginLeft: -10, borderRadius: '50%', background: '#000', boxShadow: '0 0 0 2px oklch(0.25 0.01 260)'}} />
            <div style={{position: 'absolute', bottom: 10, left: '50%', width: 130, height: 6, marginLeft: -65, borderRadius: 3, background: 'oklch(1 0 0 / 0.55)'}} />
          </>
        ) : (
          <div style={{position: 'absolute', top: 18, left: '50%', width: 150, height: 42, marginLeft: -75, borderRadius: 21, background: '#000'}} />
        )}
      </div>
    </div>
  );
};
