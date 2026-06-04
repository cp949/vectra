import type { PlaygroundExample } from '@repo/playground';
import type { PixiRuntimeSeed } from '../../pixi/api';
import code from './source.exam.ts?raw';

/** Orbit Segment 예제의 runtimeSeed */
const seed: PixiRuntimeSeed = {
  size: { width: 720, height: 440 },
  pointer: { x: 510, y: 180 },
  segment: { a: { x: 150, y: 330 }, b: { x: 570, y: 140 } },
  circle: { center: { x: 360, y: 220 }, radius: 110 },
};

/** Orbit Segment 예제 */
export const orbitSegmentExample: PlaygroundExample<PixiRuntimeSeed> = {
  id: 'orbit-segment',
  title: 'Orbit Segment',
  description: 'orbit marker와 segment를 움직이며 circle relation을 확인한다',
  categoryId: 'math',
  source: { language: 'ts', code },
  runtimeSeed: seed,
};
