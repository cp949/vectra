import type { PlaygroundExample } from '@repo/playground';
import type { PixiRuntimeSeed } from '../../pixi/api';
import code from './source.exam.ts?raw';

/** Segment Supporting Line Foot 예제의 runtimeSeed */
const seed: PixiRuntimeSeed = {
  size: { width: 720, height: 440 },
  pointer: { x: 392, y: 318 },
  segment: { a: { x: 220, y: 308 }, b: { x: 512, y: 168 } },
  circle: { center: { x: 366, y: 238 }, radius: 0 },
};

/** Segment Supporting Line Foot 예제 */
export const segmentSupportingLineFootExample: PlaygroundExample<PixiRuntimeSeed> = {
  id: 'segment-supporting-line-foot',
  title: 'Segment Supporting Line Foot',
  description:
    'point 핸들을 drag하면 고정 선분의 지지직선 위 수선의 발을 unclamped로 투영하고, 끝점 바깥으로 끌면 발이 연장선 위로 나간다',
  categoryId: 'segment',
  source: { language: 'ts', code },
  runtimeSeed: seed,
};
