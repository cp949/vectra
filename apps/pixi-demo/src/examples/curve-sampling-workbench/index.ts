import type { PlaygroundExample } from '@repo/playground';
import type { PixiRuntimeSeed } from '../../pixi/api';
import code from './source.exam.ts?raw';

const seed: PixiRuntimeSeed = {
  size: { width: 780, height: 540 },
  pointer: { x: 0, y: 0 },
  segment: { a: { x: 0, y: 0 }, b: { x: 0, y: 0 } },
  circle: { center: { x: 0, y: 0 }, radius: 0 },
};

export const curveSamplingWorkbenchExample: PlaygroundExample<PixiRuntimeSeed> = {
  id: 'curve-sampling-workbench',
  title: 'Curve Sampling Workbench',
  description: 'arc, segment, polyline, path의 거리 기반 sampling과 proximity probe를 비교한다',
  categoryId: 'curve',
  source: { language: 'ts', code },
  runtimeSeed: seed,
};
