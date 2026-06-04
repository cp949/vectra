import type { PlaygroundExample } from '@repo/playground';
import type { PixiRuntimeSeed } from '../../pixi/api';
import code from './source.exam.ts?raw';

/** Vector Steering Field 예제의 runtimeSeed */
const seed: PixiRuntimeSeed = {
  size: { width: 720, height: 440 },
  pointer: { x: 360, y: 220 },
  segment: { a: { x: 0, y: 0 }, b: { x: 0, y: 0 } },
  circle: { center: { x: 0, y: 0 }, radius: 0 },
};

/** Vector Steering Field 예제 */
export const vectorSteeringFieldExample: PlaygroundExample<PixiRuntimeSeed> = {
  id: 'vector-steering-field',
  title: 'Vector Steering Field',
  description:
    'pointer를 향해 방향을 바꾸며 이동하는 40개 agent. vec/angle/random domain을 animation loop에서 사용한다',
  categoryId: 'vector',
  source: { language: 'ts', code },
  runtimeSeed: seed,
};
