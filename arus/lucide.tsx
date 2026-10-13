// The app's icons (lucide), redrawn as path data on a 24px grid, stroke 2.2, round caps.
import type {Tone} from './palette';
import {pop} from './palette';

export const PATHS = {
  house: 'M3 10.5L12 3l9 7.5V20a1 1 0 01-1 1h-5v-7H9v7H4a1 1 0 01-1-1z',
  receiptText: 'M4 2v20l2-1.5 2 1.5 2-1.5 2 1.5 2-1.5 2 1.5 2-1.5 2 1.5V2l-2 1.5L16 2l-2 1.5L12 2l-2 1.5L8 2 6 3.5zM8 8h8M8 12h8M8 16h5',
  target: 'M12 3a9 9 0 100 18 9 9 0 000-18zM12 7a5 5 0 100 10 5 5 0 000-10zM12 11a1 1 0 100 2 1 1 0 000-2z',
  plus: 'M12 5v14M5 12h14',
  wallet: 'M4 7.5V7a2 2 0 012-2h11v2.5M3 7.5h18v12H3zM16.5 13.5h.01',
  chartPie: 'M21.2 15.9A10 10 0 118 2.8M22 12A10 10 0 0012 2v10z',
  tags: 'M20.6 10.4l-8-8H4v8.6l8 8 8.6-8.6zM7.5 7.5h.01',
  users: 'M9 11.3a3.3 3.3 0 100-6.6 3.3 3.3 0 000 6.6zM3 19.5c0-3.3 2.7-5.5 6-5.5s6 2.2 6 5.5M16.5 5.2a3 3 0 010 5.6M18 14.3c2 .6 3.2 2.5 3.2 5.2',
  flame: 'M8.5 14.5A2.5 2.5 0 0011 12c0-1.4-.5-2-1-3-1.1-2.2-.1-4.2 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 11-14 0c0-1.2.5-2.6 1.5-3.5z',
  utensils: 'M3 2v7c0 1.1.9 2 2 2h4a2 2 0 002-2V2M7 2v20M21 15V2a5 5 0 00-5 5v6c0 1.1.9 2 2 2h3zM21 15v7',
  trendingUp: 'M22 7l-8.5 8.5-5-5L2 17M16 7h6v6',
  eye: 'M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7zM12 9a3 3 0 100 6 3 3 0 000-6z',
  chevronDown: 'M6 9l6 6 6-6',
  arrowDownLeft: 'M17 7L7 17M17 17H7V7',
  arrowUpRight: 'M7 17L17 7M7 7h10v10',
  arrowLeftRight: 'M8 3L4 7l4 4M4 7h16M16 21l4-4-4-4M20 17H4',
  shoppingBag: 'M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4zM3 6h18M16 10a4 4 0 01-8 0',
  bus: 'M4.5 3.5h15a2.5 2.5 0 012.5 2.5v9a2.5 2.5 0 01-2.5 2.5h-15A2.5 2.5 0 012 15V6a2.5 2.5 0 012.5-2.5zM2 11h20M8 17.5V20M16 17.5V20M8.5 14.5h.01M15.5 14.5h.01',
  banknote: 'M2 6h20v12H2zM12 14.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5zM6 12h.01M18 12h.01',
  landmark: 'M3 9.5L12 4l9 5.5M5 10v8M9.5 10v8M14.5 10v8M19 10v8M3 20h18',
  smartphone: 'M7 2h10a2 2 0 012 2v16a2 2 0 01-2 2H7a2 2 0 01-2-2V4a2 2 0 012-2zM12 18h.01',
  piggyBank: 'M19 5c-1.5 0-2.8 1.4-3 2-3.5-1.5-11-.3-11 5 0 1.8 0 3 2 4.5V20h4v-2h3v2h4v-4c1-.5 1.7-1 2-2h2v-4h-2c0-1-.5-1.5-1-2V5zM2 9v1c0 1.1.9 2 2 2h1',
} as const;
export type IconName = keyof typeof PATHS;

export const Lucide = ({name, size, color, strokeWidth = 2.2}: {name: IconName; size: number; color: string; strokeWidth?: number}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" style={{display: 'block', flex: 'none'}}>
    <path d={PATHS[name]} />
  </svg>
);

// A rounded colour tile with an icon: the "service" look of the app (sizes in app px; scale as needed).
const SIZES = {sm: {box: 36, radius: 12, icon: 18}, md: {box: 44, radius: 16, icon: 20}, lg: {box: 56, radius: 18, icon: 24}};
export const Tile = ({icon, tone = 'mint', size = 'md', scale = 1}: {icon: IconName; tone?: Tone; size?: keyof typeof SIZES; scale?: number}) => {
  const s = SIZES[size];
  const {strong, soft} = pop(tone);
  return (
    <span style={{display: 'grid', placeItems: 'center', flex: 'none', width: s.box * scale, height: s.box * scale, borderRadius: s.radius * scale, background: soft}}>
      <Lucide name={icon} size={s.icon * scale} color={strong} />
    </span>
  );
};

// What the app draws for each default category / account kind (features/*/visual.ts).
export const CATEGORY: Record<string, {icon: IconName; tone: Tone}> = {
  Makan: {icon: 'utensils', tone: 'tangerine'},
  Transport: {icon: 'bus', tone: 'sky'},
  Belanja: {icon: 'shoppingBag', tone: 'bubblegum'},
  Tagihan: {icon: 'receiptText', tone: 'grape'},
  Hiburan: {icon: 'target', tone: 'grape'},
  Gaji: {icon: 'banknote', tone: 'mint'},
};
export const ACCOUNT: Record<string, {icon: IconName; tone: Tone; label: string}> = {
  cash: {icon: 'wallet', tone: 'sun', label: 'Cash'},
  bank: {icon: 'landmark', tone: 'ocean', label: 'Bank account'},
  ewallet: {icon: 'smartphone', tone: 'grape', label: 'E-wallet'},
};
