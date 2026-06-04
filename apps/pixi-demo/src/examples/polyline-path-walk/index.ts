import type { PlaygroundExample } from '@repo/playground';
import type { PixiRuntimeSeed } from '../../pixi/api';
import code from './source.exam.ts?raw';

/** Polyline Path Walk 예제의 runtimeSeed */
const seed: PixiRuntimeSeed = {
  size: { width: 720, height: 440 },
  pointer: { x: 360, y: 220 },
  segment: { a: { x: 120, y: 340 }, b: { x: 600, y: 120 } },
  circle: { center: { x: 360, y: 220 }, radius: 90 },
};

/** Polyline Path Walk 예제 */
export const polylinePathWalkExample: PlaygroundExample<PixiRuntimeSeed> = {
  id: 'polyline-path-walk',
  title: 'Polyline Path Walk',
  description: 'polyline 꼭짓점 편집, RDP simplify, arc-length sampling, closest point를 한 장면에서 갱신한다',
  categoryId: 'path',
  source: { language: 'ts', code },
  runtimeSeed: seed,
};
