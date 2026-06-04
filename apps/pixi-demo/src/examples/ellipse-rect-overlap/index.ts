import type { PlaygroundExample } from '@repo/playground';
import type { PixiRuntimeSeed } from '../../pixi/api';
import code from './source.exam.ts?raw';

/** Ellipse Rect Overlap 예제의 runtimeSeed */
const seed: PixiRuntimeSeed = {
  size: { width: 720, height: 440 },
  pointer: { x: 150, y: 110 },
  segment: { a: { x: 0, y: 0 }, b: { x: 0, y: 0 } },
  circle: { center: { x: 0, y: 0 }, radius: 0 },
};

/** Ellipse Rect Overlap 예제 */
export const ellipseRectOverlapExample: PlaygroundExample<PixiRuntimeSeed> = {
  id: 'ellipse-rect-overlap',
  title: 'Ellipse Rect Overlap',
  description:
    '타원형 cursor를 drag하면 고정 사각 영역(AABB)과 겹치는지 매 프레임 판정하고, 겹치거나 접하면 두 도형이 hit 색으로 바뀐다',
  categoryId: 'ellipse',
  source: { language: 'ts', code },
  runtimeSeed: seed,
};
