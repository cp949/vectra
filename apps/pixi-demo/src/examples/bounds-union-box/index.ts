import type { PlaygroundExample } from '@repo/playground';
import type { PixiRuntimeSeed } from '../../pixi/api';
import code from './source.exam.ts?raw';

/** Bounds Union Box 예제의 runtimeSeed */
const seed: PixiRuntimeSeed = {
  size: { width: 720, height: 440 },
  pointer: { x: 510, y: 300 },
  segment: { a: { x: 0, y: 0 }, b: { x: 0, y: 0 } },
  circle: { center: { x: 0, y: 0 }, radius: 0 },
};

/** Bounds Union Box 예제 */
export const boundsUnionBoxExample: PlaygroundExample<PixiRuntimeSeed> = {
  id: 'bounds-union-box',
  title: 'Bounds Union Box',
  description:
    'box B를 drag하면 고정 box A와 B를 모두 감싸는 최소 합집합 AABB가 갱신되고, 합집합의 각 변이 어느 box에서 왔는지(componentwise min/max) 변 색으로 보인다',
  categoryId: 'rect',
  source: { language: 'ts', code },
  runtimeSeed: seed,
};
