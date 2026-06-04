import type { PlaygroundExample } from '@repo/playground';
import type { PixiRuntimeSeed } from '../../pixi/api';
import code from './source.exam.ts?raw';

/** Vector Projection Reflection Lab 예제의 runtimeSeed */
const seed: PixiRuntimeSeed = {
  size: { width: 720, height: 440 },
  pointer: { x: 500, y: 160 },
  segment: { a: { x: 0, y: 0 }, b: { x: 0, y: 0 } },
  circle: { center: { x: 0, y: 0 }, radius: 0 },
};

/** Vector Projection Reflection Lab 예제 */
export const vectorProjectionReflectionLabExample: PlaygroundExample<PixiRuntimeSeed> = {
  id: 'vector-projection-reflection-lab',
  title: 'Vector Projection Reflection Lab',
  description: 'incident vector와 normal handle을 드래그해 projection, rejection, reflection 관계를 비교한다',
  categoryId: 'vector',
  source: { language: 'ts', code },
  runtimeSeed: seed,
};
