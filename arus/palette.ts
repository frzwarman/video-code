import type {CSSProperties} from 'react';
import {loadFont} from '@remotion/google-fonts/PlusJakartaSans';

// Arus after the layout revamp (~/Documents/financially/src/index.css): phone-first, Plus Jakarta Sans,
// a jade Home band, solid white panels, colourful "pop" tiles. Light theme, which is what a phone shows.
export const C = {
  // The film's backdrop is the app's Home band.
  bandFrom: 'oklch(0.47 0.115 163)',
  bandTo: 'oklch(0.55 0.14 161)',
  bandGlow: 'oklch(0.78 0.16 158)',
  // Text and lines that sit directly on the band.
  onBand: '#fff',
  onBandSoft: 'oklch(1 0 0 / 0.85)',
  highlight: 'oklch(0.93 0.11 165)', // mint emphasis on jade
  highlightSoft: 'oklch(0.93 0.11 165 / 0.18)',
  expenseOnBand: 'oklch(0.84 0.15 28)', // a red figure that still reads on jade
  // App surfaces and text (light).
  surface: 'oklch(0.972 0.007 165)',
  raised: 'oklch(0.997 0.002 165)',
  sunken: 'oklch(0.945 0.014 165)',
  line: 'oklch(0.905 0.016 165)',
  lineStrong: 'oklch(0.82 0.025 165)',
  ink: 'oklch(0.26 0.035 168)',
  inkSoft: 'oklch(0.47 0.03 168)',
  inkFaint: 'oklch(0.55 0.025 168)',
  accent: 'oklch(0.67 0.165 160)',
  accentStrong: 'oklch(0.5 0.125 162)',
  accentSoft: 'oklch(0.95 0.045 160)',
  accentInk: 'oklch(0.42 0.1 163)',
  onAccent: '#fff',
  income: 'oklch(0.53 0.15 142)',
  incomeSoft: 'oklch(0.94 0.06 142)',
  expense: 'oklch(0.56 0.19 25)',
  expenseSoft: 'oklch(0.94 0.045 25)',
  transfer: 'oklch(0.53 0.14 252)',
  transferSoft: 'oklch(0.94 0.04 252)',
  warn: 'oklch(0.56 0.12 70)',
  warnSoft: 'oklch(0.95 0.06 80)',
  warnBar: 'oklch(0.8 0.16 85)', // a budget bar in its middle stretch: yellow
  chartIncome: 'oklch(0.45 0.13 142)',
  chartExpense: 'oklch(0.64 0.19 25)',
  // Logo gradient (public/favicon.svg) and the shell's brand tile.
  logoA: '#3fd6ad',
  logoB: '#0f6b5b',
  brandTile: 'linear-gradient(135deg, oklch(0.74 0.16 158), oklch(0.46 0.11 165))',
};

// Pop tones: a soft tile background and a strong icon colour (src/components/ui/tile.tsx).
export type Tone = 'mint' | 'sky' | 'sun' | 'coral' | 'grape' | 'bubblegum' | 'tangerine' | 'ocean' | 'slate';
const HUE: Record<Tone, number> = {mint: 160, sky: 230, sun: 85, coral: 28, grape: 300, bubblegum: 350, tangerine: 55, ocean: 262, slate: 200};
export const pop = (tone: Tone) =>
  tone === 'slate' ? {strong: 'oklch(0.5 0.03 200)', soft: 'oklch(0.93 0.01 200)'} : {strong: `oklch(0.55 0.15 ${HUE[tone]})`, soft: `oklch(0.94 0.05 ${HUE[tone]})`};

// OS chrome the film draws (notifications, share sheets, browser menus) stays dark, as on a phone.
export const OS = {
  bg: 'oklch(0.24 0.02 180 / 0.96)',
  panel: 'oklch(0.26 0.02 180)',
  ink: 'oklch(0.96 0.008 175)',
  soft: 'oklch(0.75 0.03 175)',
  faint: 'oklch(0.58 0.035 175)',
  line: 'oklch(0.8 0.06 175 / 0.16)',
  sunken: 'oklch(0.2 0.02 180)',
};

// Plus Jakarta Sans everywhere; weight carries the hierarchy (800 display, 700 headings, 600 labels).
const jakarta = loadFont('normal', {weights: ['400', '600', '700', '800'], subsets: ['latin']}).fontFamily;
export const display = jakarta;
export const body = jakarta;

// The app's resting card at film scale: a solid white panel, a hairline, an ink-hued shadow.
export const panel: CSSProperties = {
  background: C.raised,
  border: `1px solid ${C.line}`,
  borderRadius: 48,
  boxShadow: '0 2px 4px oklch(0.3 0.06 168 / 0.06), 0 24px 56px -32px oklch(0.3 0.06 168 / 0.3)',
};
