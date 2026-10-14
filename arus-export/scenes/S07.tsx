// S7 — Closing: logo draws its wave, wordmark, tagline, link. Last 1.5s silent hold, creeping in.
import type {CameraKey, Cue} from '../../lib/core';
import {END_SFX, EndCard} from '../../lib/EndCard';
import {cue, voiceEnd} from '../voice';

// Tight on the logo as it draws, then pull back for the wordmark; the end card then builds on its own creep.
export const camera: CameraKey[] = [{at: 0, zoom: 1.6, x: 540, y: 630, dur: 1}, {at: cue('S7', 0) - 10, zoom: 1}];
export const sfx: Cue[] = END_SFX;

export const Scene = () => <EndCard wordAt={cue('S7', 0)} lineAt={cue('S7', 1)} linkAt={voiceEnd('S7') + 6} hint="Laporan → Export" />;
