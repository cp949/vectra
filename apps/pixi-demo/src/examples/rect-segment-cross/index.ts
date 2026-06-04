import type { PlaygroundExample } from '@repo/playground';
import type { PixiRuntimeSeed } from '../../pixi/api';
import code from './source.exam.ts?raw';

/** Rect Segment Cross 예제의 runtimeSeed */
const seed: PixiRuntimeSeed = {
  size: { width: 720, height: 440 },
  pointer: { x: 600, y: 120 },
  segment: { a: { x: 0, y: 0 }, b: { x: 0, y: 0 } },
  circle: { center: { x: 0, y: 0 }, radius: 0 },
};

/** Rect Segment Cross 예제 */
export const rectSegmentCrossExample: PlaygroundExample<PixiRuntimeSeed> = {
  id: 'rect-segment-cross',
  title: 'Rect Segment Cross',
  description:
    '끝점 핸들을 drag하면 유한 선분이 고정 사각 영역(AABB)을 가로지르는지 매 프레임 판정하고, 가로지르면 선분·사각형이 hit 색으로 바뀐다',
  categoryId: 'segment',
  source: { language: 'ts', code },
  runtimeSeed: seed,
};
