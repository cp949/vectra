import type { PlaygroundExample } from '@repo/playground';
import type { PixiRuntimeSeed } from '../../pixi/api';
import code from './source.exam.ts?raw';

/** Segment Segment Cross 예제의 runtimeSeed */
const seed: PixiRuntimeSeed = {
  size: { width: 720, height: 440 },
  pointer: { x: 500, y: 140 },
  segment: { a: { x: 0, y: 0 }, b: { x: 0, y: 0 } },
  circle: { center: { x: 0, y: 0 }, radius: 0 },
};

/** Segment Segment Cross 예제 */
export const segmentSegmentCrossExample: PlaygroundExample<PixiRuntimeSeed> = {
  id: 'segment-segment-cross',
  title: 'Segment Segment Cross',
  description:
    '선분 B의 자유 끝점을 drag하면 고정 선분 A와 교차하는지 매 프레임 판정하고, 교차할 때 두 선분이 hit 색으로 바뀐다',
  categoryId: 'segment',
  source: { language: 'ts', code },
  runtimeSeed: seed,
};
