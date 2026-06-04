import type { PlaygroundExample } from '@repo/playground';
import type { PixiRuntimeSeed } from '../../pixi/api';
import code from './source.exam.ts?raw';

/** Ray Intersection Lab 예제의 runtimeSeed */
const seed: PixiRuntimeSeed = {
  size: { width: 760, height: 460 },
  pointer: { x: 380, y: 230 },
  segment: { a: { x: 130, y: 320 }, b: { x: 430, y: 140 } },
  circle: { center: { x: 380, y: 230 }, radius: 90 },
};

/** Ray Intersection Lab 예제 */
export const rayIntersectionLabExample: PlaygroundExample<PixiRuntimeSeed> = {
  id: 'ray-intersection-lab',
  title: 'Ray Intersection Lab',
  description: '두 ray의 origin과 direction handle을 드래그해 forward 교점과 degenerate 상태를 확인한다',
  categoryId: 'ray',
  source: { language: 'ts', code },
  runtimeSeed: seed,
};
