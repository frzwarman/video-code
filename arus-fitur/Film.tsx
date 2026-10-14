// Video 2 (arus-fitur): scene timeline from TREATMENT.md. Every frame is a function of the frame number.
import {makeFilm} from '../lib/Film';
import {VOICE} from './voice';
import * as S01 from './scenes/S01';
import * as S02 from './scenes/S02';
import * as S03 from './scenes/S03';
import * as S04 from './scenes/S04';
import * as S05 from './scenes/S05';
import * as S06 from './scenes/S06';
import * as S07 from './scenes/S07';

export const {Film, DURATION} = makeFilm(
  [
    {id: 'S1', title: 'Hook', enter: 'first', mod: S01},
    {id: 'S2', title: 'Akun', enter: 'through', mod: S02},
    {id: 'S3', title: 'Kategori', enter: 'relay', mod: S03},
    {id: 'S4', title: 'Anggaran', enter: 'through', mod: S04},
    {id: 'S5', title: 'Workspace', enter: 'relay', mod: S05},
    {id: 'S6', title: 'Foto profil', enter: 'relay', mod: S06},
    {id: 'S7', title: 'Logo + CTA', enter: 'through', mod: S07},
  ],
  VOICE,
);
