import type {ReactNode} from 'react';

// Simple stroke icons on a 24px grid, drawn for this video.
const Icon = ({size, color, children}: {size: number; color: string; children: ReactNode}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" style={{display: 'block'}}>
    {children}
  </svg>
);

type P = {size: number; color: string};

export const Bank = (p: P) => (
  <Icon {...p}>
    <path d="M3 9.5L12 4l9 5.5M5 10v8M9.5 10v8M14.5 10v8M19 10v8M3 20h18" />
  </Icon>
);

export const Cash = (p: P) => (
  <Icon {...p}>
    <rect x={2.5} y={6} width={19} height={12} rx={2} />
    <circle cx={12} cy={12} r={2.8} />
  </Icon>
);

export const Wallet = (p: P) => (
  <Icon {...p}>
    <path d="M4 7.5V7a2 2 0 012-2h11v2.5" />
    <rect x={3} y={7.5} width={18} height={12} rx={2} />
    <circle cx={16.5} cy={13.5} r={1.2} fill={p.color} />
  </Icon>
);

export const Device = (p: P) => (
  <Icon {...p}>
    <rect x={6.5} y={2.5} width={11} height={19} rx={2.5} />
    <path d="M11 18.5h2" />
  </Icon>
);

/** `open` 0 → 1 raises the shackle. */
export const Lock = ({open = 0, ...p}: P & {open?: number}) => (
  <Icon {...p}>
    <path d="M7.5 11V8a4.5 4.5 0 019 0v3" transform={`translate(0 ${-3 * open})`} />
    <rect x={5} y={11} width={14} height={10} rx={2} />
    <path d="M12 15v2" />
  </Icon>
);

export const Database = (p: P) => (
  <Icon {...p}>
    <ellipse cx={12} cy={5.5} rx={7.5} ry={2.8} />
    <path d="M4.5 5.5v13c0 1.5 3.4 2.8 7.5 2.8s7.5-1.3 7.5-2.8v-13M4.5 12c0 1.5 3.4 2.8 7.5 2.8s7.5-1.3 7.5-2.8" />
  </Icon>
);

/** `slash` 0 → 1 draws the strike across the eye. */
export const EyeOff = ({slash = 1, ...p}: P & {slash?: number}) => (
  <Icon {...p}>
    <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z" />
    <circle cx={12} cy={12} r={2.8} />
    <path d="M4 4l16 16" pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - slash} />
  </Icon>
);

export const Users = (p: P) => (
  <Icon {...p}>
    <circle cx={9} cy={8} r={3.3} />
    <path d="M3 19.5c0-3.3 2.7-5.5 6-5.5s6 2.2 6 5.5M16.5 5.2a3 3 0 010 5.6M18 14.3c2 .6 3.2 2.5 3.2 5.2" />
  </Icon>
);

export const Coffee = (p: P) => (
  <Icon {...p}>
    <path d="M4 9h13v5a5 5 0 01-5 5H9a5 5 0 01-5-5V9zM17 10h1.5a2.5 2.5 0 010 5H17M8 3.5v2.5M12 3.5v2.5" />
  </Icon>
);

export const Bag = (p: P) => (
  <Icon {...p}>
    <path d="M5 8h14l-1 12H6L5 8zM9 8V6.5a3 3 0 016 0V8" />
  </Icon>
);

export const Bus = (p: P) => (
  <Icon {...p}>
    <rect x={4.5} y={3.5} width={15} height={14} rx={2.5} />
    <path d="M4.5 11h15M8 17.5V20M16 17.5V20" />
    <circle cx={8.5} cy={14.5} r={0.8} fill={p.color} />
    <circle cx={15.5} cy={14.5} r={0.8} fill={p.color} />
  </Icon>
);

export const Receipt = (p: P) => (
  <Icon {...p}>
    <path d="M6 3h12v18l-2-1.5-2 1.5-2-1.5-2 1.5-2-1.5L6 21V3zM9 8h6M9 12h6M9 16h3" />
  </Icon>
);

export const Ticket = (p: P) => (
  <Icon {...p}>
    <path d="M3 8a2 2 0 002-2h14a2 2 0 002 2v2a2 2 0 000 4v2a2 2 0 00-2 2H5a2 2 0 00-2-2v-2a2 2 0 000-4V8zM14 6v12" />
  </Icon>
);

export const Calendar = (p: P) => (
  <Icon {...p}>
    <rect x={3.5} y={5} width={17} height={15} rx={2.5} />
    <path d="M3.5 10h17M8 3v4M16 3v4" />
  </Icon>
);
