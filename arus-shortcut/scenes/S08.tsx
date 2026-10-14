// S8 — Closing: logo draws its wave, wordmark, tagline, link, where the token lives. Last 1.5s silent hold.
import type {CameraKey, Cue} from '../../lib/core';
import {END_SFX, EndCard} from '../../lib/EndCard';
import {cue, voiceEnd} from '../voice';

export const camera: CameraKey[] = [{at: 0, zoom: 1.6, x: 540, y: 630, dur: 1}, {at: cue('S8', 0) - 10, zoom: 1}];
export const sfx: Cue[] = END_SFX;

export const Scene = () => <EndCard wordAt={cue('S8', 0)} lineAt={cue('S8', 1)} linkAt={voiceEnd('S8') + 6} hint="Settings → iPhone quick add" />;
