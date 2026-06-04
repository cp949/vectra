import type { PlaygroundExample } from '@repo/playground';
import type { PixiRuntimeSeed } from '../../pixi/api';
import code from './source.exam.ts?raw';

/** Bezier Control Inspector 예제의 runtimeSeed */
const seed: PixiRuntimeSeed = {
  size: { width: 720, height: 440 },
  pointer: { x: 360, y: 220 },
  segment: { a: { x: 100, y: 400 }, b: { x: 620, y: 400 } },
  circle: { center: { x: 360, y: 220 }, radius: 80 },
};

/** Bezier Control Inspector 예제 */
export const bezierControlInspectorExample: PlaygroundExample<PixiRuntimeSeed> = {
  id: 'bezier-control-inspector',
  title: 'Bezier Control Inspector',
  description: 'draggable control point 3개로 quadratic Bezier 곡선의 point/tangent/normal/hull을 확인한다',
  categoryId: 'curve',
  source: { language: 'ts', code },
  runtimeSeed: seed,
};
