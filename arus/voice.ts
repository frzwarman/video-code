import {makeCues} from '../lib/core';
import manifest from '../public/vo/arus/manifest.json';

export const {VOICE, cue, voiceEnd} = makeCues(manifest);
