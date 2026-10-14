import {useId} from 'react';
import {C} from './palette';

// Path is public/favicon.svg from the Arus repo; `draw` (0–1) draws the wave line on.
export const WAVE = 'M6 20c4-6 6 2 10-4s6 2 10-4';

export const Logo = ({size, draw = 1}: {size: number; draw?: number}) => {
  const id = useId();
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" style={{display: 'block'}}>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={C.logoA} />
          <stop offset="1" stopColor={C.logoB} />
        </linearGradient>
      </defs>
      <rect width="32" height="32" rx="9" fill={`url(#${id})`} />
      {draw > 0 && (
        <path
          d={WAVE}
          stroke="#fff"
          strokeWidth="3.2"
          strokeLinecap="round"
          fill="none"
          pathLength={1}
          strokeDasharray="1 1"
          strokeDashoffset={1 - draw}
        />
      )}
    </svg>
  );
};
