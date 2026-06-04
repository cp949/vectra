import type { PlaygroundExample } from '@repo/playground';
import type { PixiRuntimeSeed } from '../../pixi/api';
import code from './source.exam.ts?raw';

/** Cubic Bezier Inspector 예제의 runtimeSeed */
const seed: PixiRuntimeSeed = {
  size: { width: 720, height: 440 },
  pointer: { x: 360, y: 220 },
  segment: { a: { x: 120, y: 320 }, b: { x: 600, y: 320 } },
  circle: { center: { x: 360, y: 220 }, radius: 80 },
};

/** Cubic Bezier Inspector 예제 */
export const cubicBezierInspectorExample: PlaygroundExample<PixiRuntimeSeed> = {
  id: 'cubic-bezier-inspector',
  title: 'Cubic Bezier Inspector',
  description: 'draggable control point 4개로 cubic Bezier 곡선의 point/tangent/normal/hull/bounds를 확인한다',
  categoryId: 'curve',
  source: { language: 'ts', code },
  runtimeSeed: seed,
};
