import type {CSSProperties} from 'react';
import {loadFont as loadUnbounded} from '@remotion/google-fonts/Unbounded';
import {loadFont as loadManrope} from '@remotion/google-fonts/Manrope';

// Arus dark theme, copied from ~/Documents/financially/src/index.css (.dark).
export const C = {
  // Film background: Arus teal (logo gradient, deepened so white text and dark cards read on it).
  bg: '#0f6b5b',
  bgTop: '#14806b',
  bgBottom: '#0b4f43',
  // On-background text and lines: light mint, since the app's accent is too close to the teal.
  highlight: 'oklch(0.93 0.11 165)',
  highlightSoft: 'oklch(0.93 0.11 165 / 0.18)',
  onBgSoft: 'oklch(0.93 0.04 170 / 0.78)',
  // The app's own dark surface, for app screens and cards.
  surface: 'oklch(0.17 0.02 180)',
  raised: 'oklch(0.22 0.022 180)',
  sunken: 'oklch(0.14 0.018 180)',
  line: 'oklch(0.31 0.03 180)',
  lineStrong: 'oklch(0.41 0.035 180)',
  ink: 'oklch(0.96 0.008 175)',
  inkSoft: 'oklch(0.75 0.03 175)',
  inkFaint: 'oklch(0.58 0.035 175)',
  accent: 'oklch(0.76 0.13 170)',
  accentStrong: 'oklch(0.82 0.13 168)',
  accentSoft: 'oklch(0.3 0.06 172)',
  income: 'oklch(0.8 0.17 138)',
  expense: 'oklch(0.74 0.16 22)',
  transfer: 'oklch(0.76 0.12 250)',
  warn: 'oklch(0.82 0.15 78)',
  glass: 'oklch(0.24 0.025 180 / 0.86)',
  glassLine: 'oklch(0.8 0.06 175 / 0.16)',
  // Logo gradient (public/favicon.svg).
  logoA: '#3fd6ad',
  logoB: '#0f6b5b',
};

export const display = loadUnbounded('normal', {weights: ['500', '700'], subsets: ['latin']}).fontFamily;
export const body = loadManrope('normal', {weights: ['400', '600', '800'], subsets: ['latin']}).fontFamily;

// The app's glass card, scaled up for 1080px.
export const glass: CSSProperties = {
  background: C.glass,
  border: `2px solid ${C.glassLine}`,
  borderRadius: 48,
  boxShadow: '0 4px 8px oklch(0 0 0 / 0.35), 0 64px 128px -48px oklch(0 0 0 / 0.65)',
};
