import {Composition} from 'remotion';
import {Film, DURATION} from '../arus/Film';
import {Film as Fitur, DURATION as FITUR} from '../arus-fitur/Film';
import {FPS, H, W} from '../lib/core';

export const Root = () => (
  <>
    <Composition id="arus" component={Film} durationInFrames={DURATION} fps={FPS} width={W} height={H} />
    <Composition id="arus-fitur" component={Fitur} durationInFrames={FITUR} fps={FPS} width={W} height={H} />
  </>
);
