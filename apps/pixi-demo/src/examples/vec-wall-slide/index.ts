import type { PlaygroundExample } from '@repo/playground';
import type { PixiRuntimeSeed } from '../../pixi/api';
import code from './source.exam.ts?raw';

/** Vec Wall Slide 예제의 runtimeSeed */
const seed: PixiRuntimeSeed = {
  size: { width: 720, height: 440 },
  pointer: { x: 430, y: 120 },
  segment: { a: { x: 200, y: 330 }, b: { x: 560, y: 210 } },
  circle: { center: { x: 380, y: 270 }, radius: 0 },
};

/** Vec Wall Slide 예제 */
export const vecWallSlideExample: PlaygroundExample<PixiRuntimeSeed> = {
  id: 'vec-wall-slide',
  title: 'Vec Wall Slide',
  description:
    'velocity 핸들을 drag하면 고정 벽으로 파고드는 성분을 제거해 벽을 따라 미끄러지는 벡터를 다시 계산하고, slid가 항상 벽 방향에 평행함을 보인다',
  categoryId: 'vector',
  source: { language: 'ts', code },
  runtimeSeed: seed,
};
