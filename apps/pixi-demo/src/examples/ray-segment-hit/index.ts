import type { PlaygroundExample } from '@repo/playground';
import type { PixiRuntimeSeed } from '../../pixi/api';
import code from './source.exam.ts?raw';

/** Ray Segment Hit 예제의 runtimeSeed */
const seed: PixiRuntimeSeed = {
  size: { width: 720, height: 440 },
  pointer: { x: 470, y: 150 },
  segment: { a: { x: 0, y: 0 }, b: { x: 0, y: 0 } },
  circle: { center: { x: 0, y: 0 }, radius: 0 },
};

/** Ray Segment Hit 예제 */
export const raySegmentHitExample: PlaygroundExample<PixiRuntimeSeed> = {
  id: 'ray-segment-hit',
  title: 'Ray Segment Hit',
  description:
    'aim handle을 돌려 emitter에서 쏜 forward 빔의 방향을 바꾸면 그 빔이 고정 벽 segment를 가로지르는지 매 프레임 판정하고, 맞으면 hit 색으로 바뀐다',
  categoryId: 'ray',
  source: { language: 'ts', code },
  runtimeSeed: seed,
};
