import type { PlaygroundExample } from '@repo/playground';
import type { PixiRuntimeSeed } from '../../pixi/api';
import code from './source.exam.ts?raw';

/** Vec Scalar Projection 예제의 runtimeSeed */
const seed: PixiRuntimeSeed = {
  size: { width: 720, height: 440 },
  pointer: { x: 470, y: 150 },
  segment: { a: { x: 160, y: 320 }, b: { x: 560, y: 200 } },
  circle: { center: { x: 160, y: 320 }, radius: 0 },
};

/** Vec Scalar Projection 예제 */
export const vecScalarProjectionExample: PlaygroundExample<PixiRuntimeSeed> = {
  id: 'vec-scalar-projection',
  title: 'Vec Scalar Projection',
  description:
    '점 핸들 A를 drag하면 벡터 a를 고정 기준 축 b에 투영한 부호 있는 스칼라 좌표 t = dot(a,b)/|b|²를 다시 계산하고, 축 위 t·b 지점에 수선의 발을 찍어 t의 의미를 드러낸다',
  categoryId: 'vector',
  source: { language: 'ts', code },
  runtimeSeed: seed,
};
