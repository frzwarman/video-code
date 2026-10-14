// Video 4 (arus-export): scene timeline from TREATMENT.md. Every frame is a function of the frame number.
import {makeFilm} from '../lib/Film';
import {VOICE} from './voice';
import * as S01 from './scenes/S01';
import * as S02 from './scenes/S02';
import * as S03 from './scenes/S03';
import * as S04 from './scenes/S04';
import * as S05 from './scenes/S05';
import * as S06 from './scenes/S06';
import * as S07 from './scenes/S07';

// S1 ends on the phone, so S2 and S3 relay on it; the sheet (S4) and the CSV (S5) cut through; S6 relays off
// the CSV panel; the end card cuts through.
export const {Film, DURATION} = makeFilm(
  [
    {id: 'S1', title: 'Hook', enter: 'first', mod: S01},
    {id: 'S2', title: 'Laporan → Export', enter: 'relay', mod: S02},
    {id: 'S3', title: 'Semua baris', enter: 'relay', mod: S03},
    {id: 'S4', title: 'Excel', enter: 'through', mod: S04},
    {id: 'S5', title: 'CSV', enter: 'through', mod: S05},
    {id: 'S6', title: 'Aman', enter: 'relay', mod: S06},
    {id: 'S7', title: 'Logo + CTA', enter: 'through', mod: S07},
  ],
  VOICE,
);
