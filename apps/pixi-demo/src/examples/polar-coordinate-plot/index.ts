import type { PlaygroundExample } from '@repo/playground';
import type { PixiRuntimeSeed } from '../../pixi/api';
import code from './source.exam.ts?raw';

/** Polar Coordinate Plot 예제의 runtimeSeed */
const seed: PixiRuntimeSeed = {
  size: { width: 720, height: 440 },
  pointer: { x: 510, y: 150 },
  segment: { a: { x: 0, y: 0 }, b: { x: 0, y: 0 } },
  circle: { center: { x: 0, y: 0 }, radius: 0 },
};

/** Polar Coordinate Plot 예제 */
export const polarCoordinatePlotExample: PlaygroundExample<PixiRuntimeSeed> = {
  id: 'polar-coordinate-plot',
  title: 'Polar Coordinate Plot',
  description:
    'handle을 drag하면 그 점의 극좌표(r, theta)를 읽어 같은 theta 위에서 fromPolar로 stepped 작도점을 찍는다',
  categoryId: 'math',
  source: { language: 'ts', code },
  runtimeSeed: seed,
};
