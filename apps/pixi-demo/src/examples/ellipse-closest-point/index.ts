import type { PlaygroundExample } from '@repo/playground';
import type { PixiRuntimeSeed } from '../../pixi/api';
import code from './source.exam.ts?raw';

/** Ellipse Closest Point 예제의 runtimeSeed */
const seed: PixiRuntimeSeed = {
  size: { width: 720, height: 440 },
  pointer: { x: 560, y: 96 },
  segment: { a: { x: 560, y: 96 }, b: { x: 360, y: 232 } },
  circle: { center: { x: 360, y: 232 }, radius: 110 },
};

/** Ellipse Closest Point 예제 */
export const ellipseClosestPointExample: PlaygroundExample<PixiRuntimeSeed> = {
  id: 'ellipse-closest-point',
  title: 'Ellipse Closest Point',
  description:
    'probe를 drag하면 고정 ellipse 경계에서 가장 가까운 점이 marker로 스냅하고, 연결선이 경계에 수직인 최단 거리를 보인다',
  categoryId: 'ellipse',
  source: { language: 'ts', code },
  runtimeSeed: seed,
};
