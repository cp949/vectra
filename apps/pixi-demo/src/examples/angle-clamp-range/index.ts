import type { PlaygroundExample } from '@repo/playground';
import type { PixiRuntimeSeed } from '../../pixi/api';
import code from './source.exam.ts?raw';

/** Angle Clamp Range 예제의 runtimeSeed */
const seed: PixiRuntimeSeed = {
  size: { width: 720, height: 440 },
  pointer: { x: 520, y: 200 },
  segment: { a: { x: 0, y: 0 }, b: { x: 0, y: 0 } },
  circle: { center: { x: 0, y: 0 }, radius: 0 },
};

/** Angle Clamp Range 예제 */
export const angleClampRangeExample: PlaygroundExample<PixiRuntimeSeed> = {
  id: 'angle-clamp-range',
  title: 'Angle Clamp Range',
  description:
    '피벗 둘레의 handle을 drag하면 clampAngle이 입력 각을 고정 허용 부채꼴(CCW 구간)로 제한한 출력 각을 보인다. 구간 안이면 자유, 밖이면 가까운 한계로 떨어진다. turret/joint의 회전 limit와 같은 흐름이다',
  categoryId: 'angle',
  source: { language: 'ts', code },
  runtimeSeed: seed,
};
