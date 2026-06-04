import type { PlaygroundExample } from '@repo/playground';
import type { PixiRuntimeSeed } from '../../pixi/api';
import code from './source.exam.ts?raw';

/** Hermite Spline Builder 예제의 runtimeSeed */
const seed: PixiRuntimeSeed = {
  size: { width: 720, height: 440 },
  pointer: { x: 360, y: 220 },
  segment: { a: { x: 120, y: 340 }, b: { x: 600, y: 120 } },
  circle: { center: { x: 360, y: 220 }, radius: 90 },
};

/** Hermite Spline Builder 예제 */
export const hermiteSplineBuilderExample: PlaygroundExample<PixiRuntimeSeed> = {
  id: 'hermite-spline-builder',
  title: 'Hermite Spline Builder',
  description: 'endpoint와 tangent handle을 드래그해 cubic Hermite curve와 cardinal tangent preview를 비교한다',
  categoryId: 'curve',
  source: { language: 'ts', code },
  runtimeSeed: seed,
};
