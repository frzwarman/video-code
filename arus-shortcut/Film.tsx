// Video 3 (arus-shortcut): scene timeline from TREATMENT.md. Every frame is a function of the frame number.
import {makeFilm} from '../lib/Film';
import {VOICE} from './voice';
import * as S01 from './scenes/S01';
import * as S02 from './scenes/S02';
import * as S03 from './scenes/S03';
import * as S04 from './scenes/S04';
import * as S05 from './scenes/S05';
import * as S06 from './scenes/S06';
import * as S07 from './scenes/S07';
import * as S08 from './scenes/S08';

// The diagram (S2), the first Arus screen (S3) and the end card cut through; from S3 on, the phone stays put and
// each step relays on it: Arus → the shared Shortcut → Settings → the receipt.
export const {Film, DURATION} = makeFilm(
  [
    {id: 'S1', title: 'Hook', enter: 'first', mod: S01},
    {id: 'S2', title: 'Cara kerja', enter: 'through', mod: S02},
    {id: 'S3', title: '1 · Token', enter: 'through', mod: S03},
    {id: 'S4', title: '2 · Shortcut', enter: 'relay', mod: S04},
    {id: 'S5', title: '3 · Ketuk Belakang', enter: 'relay', mod: S05},
    {id: 'S6', title: '4 · Coba', enter: 'relay', mod: S06},
    {id: 'S7', title: 'Belajar', enter: 'relay', mod: S07},
    {id: 'S8', title: 'Logo + CTA', enter: 'through', mod: S08},
  ],
  VOICE,
);
