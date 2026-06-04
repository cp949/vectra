import type { PlaygroundExample } from '@repo/playground';
import type { PixiRuntimeSeed } from '../../pixi/api';
import code from './source.exam.ts?raw';

/** Vec Surface Normal 예제의 runtimeSeed */
const seed: PixiRuntimeSeed = {
  size: { width: 720, height: 440 },
  pointer: { x: 520, y: 250 },
  segment: { a: { x: 260, y: 250 }, b: { x: 520, y: 250 } },
  circle: { center: { x: 260, y: 250 }, radius: 0 },
};

/** Vec Surface Normal 예제 */
export const vecSurfaceNormalExample: PlaygroundExample<PixiRuntimeSeed> = {
  id: 'vec-surface-normal',
  title: 'Vec Surface Normal',
  description:
    'direction 핸들을 drag하면 표면 방향 벡터에 수직인 단위 법선을 다시 계산하고, 거리가 멀어져도 법선 arrow 길이는 일정하며 항상 90°를 이룬다',
  categoryId: 'vector',
  source: { language: 'ts', code },
  runtimeSeed: seed,
};
