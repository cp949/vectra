import type { PlaygroundExample } from '@repo/playground';
import type { PixiRuntimeSeed } from '../../pixi/api';
import code from './source.exam.ts?raw';

/** Rect Quadrants Split 예제의 runtimeSeed */
const seed: PixiRuntimeSeed = {
  size: { width: 720, height: 440 },
  pointer: { x: 360, y: 215 },
  segment: { a: { x: 0, y: 0 }, b: { x: 0, y: 0 } },
  circle: { center: { x: 0, y: 0 }, radius: 0 },
};

/** Rect Quadrants Split 예제 */
export const rectQuadrantsSplitExample: PlaygroundExample<PixiRuntimeSeed> = {
  id: 'rect-quadrants-split',
  title: 'Rect Quadrants Split',
  description:
    'split point를 drag하면 고정 frame rect를 4개 사분면 cell로 다시 분할하고, split point가 곧 4 cell의 공통 corner임을 보인다',
  categoryId: 'rect',
  source: { language: 'ts', code },
  runtimeSeed: seed,
};
