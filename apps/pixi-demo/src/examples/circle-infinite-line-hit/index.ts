import type { PlaygroundExample } from '@repo/playground';
import type { PixiRuntimeSeed } from '../../pixi/api';
import code from './source.exam.ts?raw';

/** Circle Infinite Line Hit 예제의 runtimeSeed */
const seed: PixiRuntimeSeed = {
  size: { width: 720, height: 440 },
  pointer: { x: 470, y: 150 },
  segment: { a: { x: 0, y: 0 }, b: { x: 0, y: 0 } },
  circle: { center: { x: 470, y: 240 }, radius: 70 },
};

/** Circle Infinite Line Hit 예제 */
export const circleInfiniteLineHitExample: PlaygroundExample<PixiRuntimeSeed> = {
  id: 'circle-infinite-line-hit',
  title: 'Circle Infinite Line Hit',
  description:
    'aim 핸들을 돌려 고정 pivot을 지나는 무한 직선의 방향을 바꾸면 그 직선이 고정 원(closed disk)에 닿는지 매 프레임 판정하고, 양방향으로 무한해 aim을 원 반대로 돌려도 backward 연장선이 원을 지나면 hit 색으로 바뀐다',
  categoryId: 'line',
  source: { language: 'ts', code },
  runtimeSeed: seed,
};
