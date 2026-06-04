import type { PlaygroundExample } from '@repo/playground';
import type { PixiRuntimeSeed } from '../../pixi/api';
import code from './source.exam.ts?raw';

/** Circle From Three Points 예제의 runtimeSeed */
const seed: PixiRuntimeSeed = {
  size: { width: 720, height: 440 },
  pointer: { x: 360, y: 140 },
  segment: { a: { x: 0, y: 0 }, b: { x: 0, y: 0 } },
  circle: { center: { x: 0, y: 0 }, radius: 0 },
};

/** Circle From Three Points 예제 */
export const circleFromThreePointsExample: PlaygroundExample<PixiRuntimeSeed> = {
  id: 'circle-from-three-points',
  title: 'Circle From Three Points',
  description:
    '점 핸들 C를 드래그하면 고정 두 점 A·B와 함께 세 점을 지나는 외접원(circumscribed circle)을 매번 다시 구성하고, 세 점이 일직선이 되면 외접원이 정의되지 않아 warn 상태로 바뀐다',
  categoryId: 'circle',
  source: { language: 'ts', code },
  runtimeSeed: seed,
};
