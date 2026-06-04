import type { PlaygroundExample } from '@repo/playground';
import type { PixiRuntimeSeed } from '../../pixi/api';
import code from './source.exam.ts?raw';

const seed: PixiRuntimeSeed = {
  size: { width: 780, height: 520 },
  pointer: { x: 0, y: 0 },
  segment: { a: { x: 0, y: 0 }, b: { x: 0, y: 0 } },
  circle: { center: { x: 0, y: 0 }, radius: 0 },
};

export const vectorCollisionResponseExample: PlaygroundExample<PixiRuntimeSeed> = {
  id: 'vector-collision-response',
  title: 'Vector Collision Response',
  description: 'incident velocity를 wall normal 기준 slide, bounce, projection response로 비교한다',
  categoryId: 'vector',
  source: { language: 'ts', code },
  runtimeSeed: seed,
};
