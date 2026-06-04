import type { PlaygroundExample } from '@repo/playground';
import type { PixiRuntimeSeed } from '../../pixi/api';
import code from './source.exam.ts?raw';

/** Group Bounds 예제의 runtimeSeed */
const seed: PixiRuntimeSeed = {
  size: { width: 720, height: 440 },
  pointer: { x: 396, y: 249 },
  segment: { a: { x: 0, y: 0 }, b: { x: 0, y: 0 } },
  circle: { center: { x: 0, y: 0 }, radius: 0 },
};

/** Group Bounds 예제 */
export const groupBoundsExample: PlaygroundExample<PixiRuntimeSeed> = {
  id: 'group-bounds',
  title: 'Group Bounds',
  description:
    'amber box를 drag하면 groupBounds가 도형 묶음 전체를 한 번에 감싸는 최소 AABB(selection bounding box)를 다시 계산한다. selection box는 항상 모든 멤버를 감싼다',
  categoryId: 'rect',
  source: { language: 'ts', code },
  runtimeSeed: seed,
};
