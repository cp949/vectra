import type { PlaygroundExample } from '@repo/playground';
import type { PixiRuntimeSeed } from '../../pixi/api';
import code from './source.exam.ts?raw';

/** Segment Contact Gates Lab 예제의 runtimeSeed */
const seed: PixiRuntimeSeed = {
  size: { width: 760, height: 460 },
  pointer: { x: 370, y: 230 },
  segment: { a: { x: 90, y: 360 }, b: { x: 670, y: 105 } },
  circle: { center: { x: 250, y: 205 }, radius: 72 },
};

/** Segment Contact Gates Lab 예제 */
export const segmentContactGatesLabExample: PlaygroundExample<PixiRuntimeSeed> = {
  id: 'segment-contact-gates-lab',
  title: 'Segment Contact Gates Lab',
  description: 'path segment와 circle, bounds, triangle gate를 드래그해 교차 상태와 단일 접점 정책을 비교한다',
  categoryId: 'segment',
  source: { language: 'ts', code },
  runtimeSeed: seed,
};
