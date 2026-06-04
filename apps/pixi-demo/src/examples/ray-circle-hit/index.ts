import type { PlaygroundExample } from '@repo/playground';
import type { PixiRuntimeSeed } from '../../pixi/api';
import code from './source.exam.ts?raw';

/** Ray Circle Hit 예제의 runtimeSeed */
const seed: PixiRuntimeSeed = {
  size: { width: 720, height: 440 },
  pointer: { x: 470, y: 160 },
  segment: { a: { x: 0, y: 0 }, b: { x: 0, y: 0 } },
  circle: { center: { x: 500, y: 230 }, radius: 70 },
};

/** Ray Circle Hit 예제 */
export const rayCircleHitExample: PlaygroundExample<PixiRuntimeSeed> = {
  id: 'ray-circle-hit',
  title: 'Ray Circle Hit',
  description:
    'aim handle을 돌려 emitter에서 쏜 forward 빔의 방향을 바꾸면 그 빔이 고정 원(closed disk)에 명중하는지 매 프레임 판정하고, 명중하면 hit 색으로 바뀐다',
  categoryId: 'ray',
  source: { language: 'ts', code },
  runtimeSeed: seed,
};
