import type { PlaygroundExample } from '@repo/playground';
import type { PixiRuntimeSeed } from '../../pixi/api';
import code from './source.exam.ts?raw';

/** Cubic Curve Analysis Lab 예제의 runtimeSeed */
const seed: PixiRuntimeSeed = {
  size: { width: 720, height: 440 },
  pointer: { x: 360, y: 220 },
  segment: { a: { x: 100, y: 315 }, b: { x: 630, y: 120 } },
  circle: { center: { x: 360, y: 220 }, radius: 72 },
};

/** Cubic Curve Analysis Lab 예제 */
export const cubicCurveAnalysisLabExample: PlaygroundExample<PixiRuntimeSeed> = {
  id: 'cubic-curve-analysis-lab',
  title: 'Cubic Curve Analysis Lab',
  description: 'cubic Bezier의 closest point, split, part, flatten, length diagnostics를 드래그로 비교한다',
  categoryId: 'curve',
  source: { language: 'ts', code },
  runtimeSeed: seed,
};
