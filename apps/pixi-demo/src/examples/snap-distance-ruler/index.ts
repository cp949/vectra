import type { PlaygroundExample } from '@repo/playground';
import type { PixiRuntimeSeed } from '../../pixi/api';
import code from './source.exam.ts?raw';

/** Snap Distance Ruler 예제의 runtimeSeed */
const seed: PixiRuntimeSeed = {
  size: { width: 720, height: 440 },
  pointer: { x: 270, y: 160 },
  segment: { a: { x: 0, y: 0 }, b: { x: 0, y: 0 } },
  circle: { center: { x: 0, y: 0 }, radius: 0 },
};

/** Snap Distance Ruler 예제 */
export const snapDistanceRulerExample: PlaygroundExample<PixiRuntimeSeed> = {
  id: 'snap-distance-ruler',
  title: 'Snap Distance Ruler',
  description:
    '고정 anchor에서 end handle을 drag하면 snapDistance가 측정 길이를 가장 가까운 step 눈금(40px)으로 snap한 marker를 자 위에 놓는다. 에디터/CAD의 치수·리사이즈 길이 스냅과 같은 흐름이다',
  categoryId: 'transform',
  source: { language: 'ts', code },
  runtimeSeed: seed,
};
