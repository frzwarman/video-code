import {useMemo} from 'react';
import {getLength} from '@remotion/paths';
import {ThreeCanvas} from '@remotion/three';
import {useCurrentFrame} from 'remotion';
import {CanvasTexture, ExtrudeGeometry, Shape, SRGBColorSpace} from 'three';
import {WAVE} from './Logo';
import {C} from './palette';

// The Logo tile as a solid: same gradient face and wave, with depth and a bevel the light catches.
// Drop-in for <Logo>: takes the same size x size box; the canvas overflows it so a turn never clips.
// `turn` spins it around the vertical axis (degrees), on top of a slow idle sway.
const TEX = 512;
const WAVE_LEN = getLength(WAVE);
const R = 9 / 32; // the favicon's corner radius

const tileGeometry = () => {
  const s = new Shape();
  s.moveTo(R, 0);
  s.lineTo(1 - R, 0);
  s.quadraticCurveTo(1, 0, 1, R);
  s.lineTo(1, 1 - R);
  s.quadraticCurveTo(1, 1, 1 - R, 1);
  s.lineTo(R, 1);
  s.quadraticCurveTo(0, 1, 0, 1 - R);
  s.lineTo(0, R);
  s.quadraticCurveTo(0, 0, R, 0);
  // The shape spans 0–1, so the face's UVs are 0–1 and the texture maps straight on.
  const g = new ExtrudeGeometry(s, {depth: 0.16, bevelEnabled: true, bevelThickness: 0.05, bevelSize: 0.035, bevelSegments: 5, curveSegments: 24});
  g.center();
  return g;
};

const Tile = ({draw, turn}: {draw: number; turn: number}) => {
  const f = useCurrentFrame();
  const geometry = useMemo(tileGeometry, []);
  const [ctx, map] = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = TEX;
    const t = new CanvasTexture(canvas);
    t.colorSpace = SRGBColorSpace;
    t.anisotropy = 8;
    return [canvas.getContext('2d')!, t] as const;
  }, []);

  // Paint the face for this frame: the favicon at 512px (32 → 16x).
  const grad = ctx.createLinearGradient(0, 0, TEX, TEX);
  grad.addColorStop(0, C.logoA);
  grad.addColorStop(1, C.logoB);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, TEX, TEX);
  if (draw > 0) {
    ctx.save();
    ctx.scale(TEX / 32, TEX / 32);
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 3.2;
    ctx.lineCap = 'round';
    ctx.setLineDash([WAVE_LEN, WAVE_LEN]);
    ctx.lineDashOffset = WAVE_LEN * (1 - draw);
    ctx.stroke(new Path2D(WAVE));
    ctx.restore();
  }
  map.needsUpdate = true;

  return (
    <mesh geometry={geometry} rotation={[0.16 + 0.05 * Math.sin(f / 37), (turn * Math.PI) / 180 + 0.22 * Math.sin(f / 50), 0]}>
      {/* Groups from ExtrudeGeometry: 0 = the two faces, 1 = the sides and bevel. */}
      {/* A little self-light keeps the face on the favicon's colours; the lights add the shading. */}
      <meshStandardMaterial attach="material-0" map={map} emissiveMap={map} emissive="#fff" emissiveIntensity={0.3} roughness={0.35} />
      <meshStandardMaterial attach="material-1" color="#178a72" roughness={0.3} metalness={0.1} />
    </mesh>
  );
};

export const Logo3D = ({size, draw = 1, turn = 0}: {size: number; draw?: number; turn?: number}) => (
  <div style={{position: 'relative', width: size, height: size}}>
    {/* 2x the tile so it can turn freely; 1 world unit = `size` px at this camera distance (fov 30). */}
    <ThreeCanvas
      width={size * 2}
      height={size * 2}
      dpr={2}
      flat
      camera={{fov: 30, position: [0, 0, 1 / Math.tan(Math.PI / 12)]}}
      style={{position: 'absolute', left: -size / 2, top: -size / 2}}
    >
      <ambientLight intensity={1.2} />
      <directionalLight position={[-1.5, 2, 3]} intensity={0.8} />
      <directionalLight position={[2, -1, 1]} intensity={0.25} />
      <Tile draw={draw} turn={turn} />
    </ThreeCanvas>
  </div>
);
