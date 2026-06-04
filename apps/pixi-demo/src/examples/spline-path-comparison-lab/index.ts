import type { PlaygroundExample } from '@repo/playground';
import type { PixiRuntimeSeed } from '../../pixi/api';
import code from './source.exam.ts?raw';

/** Spline Path Comparison Lab 예제의 runtimeSeed */
const seed: PixiRuntimeSeed = {
  size: { width: 720, height: 440 },
  pointer: { x: 360, y: 220 },
  segment: { a: { x: 120, y: 330 }, b: { x: 600, y: 120 } },
  circle: { center: { x: 360, y: 220 }, radius: 86 },
};

/** Spline Path Comparison Lab 예제 */
export const splinePathComparisonLabExample: PlaygroundExample<PixiRuntimeSeed> = {
  id: 'spline-path-comparison-lab',
  title: 'Spline Path Comparison Lab',
  description: 'control point와 closed toggle을 조작해 spline path 변환과 probe marker를 비교한다',
  categoryId: 'curve',
  source: { language: 'ts', code },
  runtimeSeed: seed,
};
