import {Config} from '@remotion/cli/config';

// WebGL (lib/Logo3D.tsx) renders blank in headless Chrome on macOS without ANGLE.
Config.setChromiumOpenGlRenderer('angle');
