import type {ComponentType} from 'react';
import {back, prog} from './core';
import {C, glass} from './palette';

// A glass icon badge that pops in at frame `at` and then holds still.
export const Sticker = ({Icon, x, y, at, f, tilt = 0, size = 150}: {Icon: ComponentType<{size: number; color: string}>; x: number; y: number; at: number; f: number; tilt?: number; size?: number}) => {
  const p = prog(f, at, 20, back);
  if (p <= 0) return null;
  return (
    <div
      style={{
        ...glass,
        position: 'absolute',
        left: x,
        top: y,
        width: size,
        height: size,
        borderRadius: size * 0.32,
        display: 'grid',
        placeItems: 'center',
        opacity: prog(f, at, 8),
        transform: `scale(${p}) rotate(${tilt}deg)`,
      }}
    >
      <Icon size={size * 0.48} color={C.accent} />
    </div>
  );
};
