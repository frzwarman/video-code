import {Composition} from 'remotion';
import {Film, DURATION} from '../arus/Film';
import {FPS, H, W} from '../arus/core';

export const Root = () => (
  <Composition id="arus" component={Film} durationInFrames={DURATION} fps={FPS} width={W} height={H} />
);
