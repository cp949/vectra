import type { PlaygroundExample } from '@repo/playground';
import type { PixiRuntimeSeed } from '../../pixi/api';
import code from './source.exam.ts?raw';

const seed: PixiRuntimeSeed = {
  size: { width: 780, height: 520 },
  pointer: { x: 0, y: 0 },
  segment: { a: { x: 0, y: 0 }, b: { x: 0, y: 0 } },
  circle: { center: { x: 0, y: 0 }, radius: 0 },
};

export const motionInterpolationWorkbenchExample: PlaygroundExample<PixiRuntimeSeed> = {
  id: 'motion-interpolation-workbench',
  title: 'Motion Interpolation Workbench',
  description: 'point lerp, orbit rotate, direction slerp를 같은 motion preview에서 비교한다',
  categoryId: 'vector',
  source: { language: 'ts', code },
  runtimeSeed: seed,
};
