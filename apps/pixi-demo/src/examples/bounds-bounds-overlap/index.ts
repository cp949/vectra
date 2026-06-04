import type { PlaygroundExample } from '@repo/playground';
import type { PixiRuntimeSeed } from '../../pixi/api';
import code from './source.exam.ts?raw';

/** Bounds Bounds Overlap 예제의 runtimeSeed */
const seed: PixiRuntimeSeed = {
  size: { width: 720, height: 440 },
  pointer: { x: 170, y: 180 },
  segment: { a: { x: 0, y: 0 }, b: { x: 0, y: 0 } },
  circle: { center: { x: 0, y: 0 }, radius: 0 },
};

/** Bounds Bounds Overlap 예제 */
export const boundsBoundsOverlapExample: PlaygroundExample<PixiRuntimeSeed> = {
  id: 'bounds-bounds-overlap',
  title: 'Bounds Bounds Overlap',
  description:
    '박스 B를 drag하면 고정 박스 A(AABB)와 겹치는지 매 프레임 판정하고, x축·y축 구간이 모두 겹칠 때 두 박스가 hit 색으로 바뀐다',
  categoryId: 'rect',
  source: { language: 'ts', code },
  runtimeSeed: seed,
};
