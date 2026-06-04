import type { PlaygroundExample } from '@repo/playground';
import type { PixiRuntimeSeed } from '../../pixi/api';
import code from './source.exam.ts?raw';

/** Vector Orthogonal Check 예제의 runtimeSeed */
const seed: PixiRuntimeSeed = {
  size: { width: 720, height: 440 },
  pointer: { x: 510, y: 110 },
  segment: { a: { x: 0, y: 0 }, b: { x: 0, y: 0 } },
  circle: { center: { x: 0, y: 0 }, radius: 0 },
};

/** Vector Orthogonal Check 예제 */
export const vecOrthogonalCheckExample: PlaygroundExample<PixiRuntimeSeed> = {
  id: 'vec-orthogonal-check',
  title: 'Vector Orthogonal Check',
  description:
    '공통 원점에서 뻗은 두 벡터 끝점을 drag하면 단위 벡터로 정규화해 직교(90°) 여부를 판정하고 직각 marker로 강조한다',
  categoryId: 'vector',
  source: { language: 'ts', code },
  runtimeSeed: seed,
};
