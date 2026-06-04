import type { PlaygroundExample } from '@repo/playground';
import type { PixiRuntimeSeed } from '../../pixi/api';
import code from './source.exam.ts?raw';

/** Vec From Angle 예제의 runtimeSeed */
const seed: PixiRuntimeSeed = {
  size: { width: 720, height: 440 },
  pointer: { x: 360, y: 80 },
  segment: { a: { x: 0, y: 0 }, b: { x: 0, y: 0 } },
  circle: { center: { x: 0, y: 0 }, radius: 0 },
};

/** Vec From Angle 예제 */
export const vecFromAngleExample: PlaygroundExample<PixiRuntimeSeed> = {
  id: 'vec-from-angle',
  title: 'Vec From Angle',
  description:
    '수평 각도 슬라이더로 스칼라 각 θ를 정하면 fromAngle(θ)이 단위원 위 단위 방향 벡터(cos θ, sin θ)를 다시 구성한다. 슬라이더는 점이 아닌 순수 각도값이라 두 점 방향(directionTo)과 구별되는 "각 → 방향" 구성을 보인다',
  categoryId: 'vector',
  source: { language: 'ts', code },
  runtimeSeed: seed,
};
