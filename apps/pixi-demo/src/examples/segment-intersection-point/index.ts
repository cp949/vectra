import type { PlaygroundExample } from '@repo/playground';
import type { PixiRuntimeSeed } from '../../pixi/api';
import code from './source.exam.ts?raw';

/** Segment Intersection Point 예제의 runtimeSeed */
const seed: PixiRuntimeSeed = {
  size: { width: 720, height: 440 },
  pointer: { x: 360, y: 220 },
  segment: { a: { x: 0, y: 0 }, b: { x: 0, y: 0 } },
  circle: { center: { x: 0, y: 0 }, radius: 0 },
};

/** Segment Intersection Point 예제 */
export const segmentIntersectionPointExample: PlaygroundExample<PixiRuntimeSeed> = {
  id: 'segment-intersection-point',
  title: 'Segment Intersection Point',
  description: '두 선분의 끝점을 드래그해 두 선분이 실제로 겹칠 때만 교점이 나타나는 유한 선분 교차를 본다',
  categoryId: 'segment',
  source: { language: 'ts', code },
  runtimeSeed: seed,
};
