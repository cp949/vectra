import type { PlaygroundExample } from '@repo/playground';
import type { PixiRuntimeSeed } from '../../pixi/api';
import code from './source.exam.ts?raw';

/** Circle Rect Overlap 예제의 runtimeSeed */
const seed: PixiRuntimeSeed = {
  size: { width: 720, height: 440 },
  pointer: { x: 150, y: 110 },
  segment: { a: { x: 0, y: 0 }, b: { x: 0, y: 0 } },
  circle: { center: { x: 0, y: 0 }, radius: 0 },
};

/** Circle Rect Overlap 예제 */
export const circleRectOverlapExample: PlaygroundExample<PixiRuntimeSeed> = {
  id: 'circle-rect-overlap',
  title: 'Circle Rect Overlap',
  description:
    '원형 cursor를 drag하면 고정 사각형(AABB)과 겹치는지 매 프레임 판정하고, dist ≤ radius일 때 원·사각형·연결선이 hit 색으로 바뀐다',
  categoryId: 'circle',
  source: { language: 'ts', code },
  runtimeSeed: seed,
};
