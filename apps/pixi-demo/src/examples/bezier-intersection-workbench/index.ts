import type { PlaygroundExample } from '@repo/playground';
import type { PixiRuntimeSeed } from '../../pixi/api';
import code from './source.exam.ts?raw';

/** Bezier Intersection Workbench 예제의 runtimeSeed */
const seed: PixiRuntimeSeed = {
  size: { width: 760, height: 460 },
  pointer: { x: 380, y: 230 },
  segment: { a: { x: 80, y: 250 }, b: { x: 690, y: 250 } },
  circle: { center: { x: 380, y: 230 }, radius: 80 },
};

/** Bezier Intersection Workbench 예제 */
export const bezierIntersectionWorkbenchExample: PlaygroundExample<PixiRuntimeSeed> = {
  id: 'bezier-intersection-workbench',
  title: 'Bezier Intersection Workbench',
  description: 'quadratic/cubic Bezier와 기준 line의 교차 hit를 드래그로 비교한다',
  categoryId: 'curve',
  source: { language: 'ts', code },
  runtimeSeed: seed,
};
