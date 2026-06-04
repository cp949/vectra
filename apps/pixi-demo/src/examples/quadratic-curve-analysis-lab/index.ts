import type { PlaygroundExample } from '@repo/playground';
import type { PixiRuntimeSeed } from '../../pixi/api';
import code from './source.exam.ts?raw';

/** Quadratic Curve Analysis Lab 예제의 runtimeSeed */
const seed: PixiRuntimeSeed = {
  size: { width: 720, height: 440 },
  pointer: { x: 360, y: 220 },
  segment: { a: { x: 100, y: 320 }, b: { x: 620, y: 320 } },
  circle: { center: { x: 360, y: 220 }, radius: 72 },
};

/** Quadratic Curve Analysis Lab 예제 */
export const quadraticCurveAnalysisLabExample: PlaygroundExample<PixiRuntimeSeed> = {
  id: 'quadratic-curve-analysis-lab',
  title: 'Quadratic Curve Analysis Lab',
  description: 'quadratic Bezier의 closest point, bounds, split, flatten, length, cubic elevation을 드래그로 비교한다',
  categoryId: 'curve',
  source: { language: 'ts', code },
  runtimeSeed: seed,
};
