import type { PlaygroundExample } from '@repo/playground';
import type { PixiRuntimeSeed } from '../../pixi/api';
import code from './source.exam.ts?raw';

/** Rect Contains Point 예제의 runtimeSeed */
const seed: PixiRuntimeSeed = {
  size: { width: 720, height: 440 },
  pointer: { x: 410, y: 220 },
  segment: { a: { x: 0, y: 0 }, b: { x: 0, y: 0 } },
  circle: { center: { x: 0, y: 0 }, radius: 0 },
};

/** Rect Contains Point 예제 */
export const rectContainsPointExample: PlaygroundExample<PixiRuntimeSeed> = {
  id: 'rect-contains-point',
  title: 'Rect Contains Point',
  description:
    'point 핸들을 드래그하면 그 점이 고정 사각 영역(zone) 안에 있는지 매 프레임 판정하고, 안에 있으면 hit 색으로 바뀐다',
  categoryId: 'rect',
  source: { language: 'ts', code },
  runtimeSeed: seed,
};
