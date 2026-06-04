import type { PlaygroundExample } from '@repo/playground';
import type { PixiRuntimeSeed } from '../../pixi/api';
import code from './source.exam.ts?raw';

/** Rect Halves Split 예제의 runtimeSeed */
const seed: PixiRuntimeSeed = {
  size: { width: 720, height: 440 },
  pointer: { x: 360, y: 215 },
  segment: { a: { x: 0, y: 0 }, b: { x: 0, y: 0 } },
  circle: { center: { x: 0, y: 0 }, radius: 0 },
};

/** Rect Halves Split 예제 */
export const rectHalvesSplitExample: PlaygroundExample<PixiRuntimeSeed> = {
  id: 'rect-halves-split',
  title: 'Rect Halves Split',
  description:
    'divider를 좌우로 drag하면 고정 frame rect를 좌/우 두 패널(first/second)로 다시 분할하고, divider가 곧 두 패널의 공통 변임을 보인다',
  categoryId: 'rect',
  source: { language: 'ts', code },
  runtimeSeed: seed,
};
