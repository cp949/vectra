import type { PlaygroundExample } from '@repo/playground';
import type { PixiRuntimeSeed } from '../../pixi/api';
import code from './source.exam.ts?raw';

/** Shape Hitbox Lab 예제의 runtimeSeed */
const seed: PixiRuntimeSeed = {
  size: { width: 760, height: 480 },
  pointer: { x: 0, y: 0 },
  segment: { a: { x: 0, y: 0 }, b: { x: 0, y: 0 } },
  circle: { center: { x: 0, y: 0 }, radius: 0 },
};

/** Shape Hitbox Lab 예제 */
export const shapeHitboxLabExample: PlaygroundExample<PixiRuntimeSeed> = {
  id: 'shape-hitbox-lab',
  title: 'Shape Hitbox Lab',
  description: 'pointer, circle, triangle, segment hitbox를 같은 판정판에서 drag하며 zone 충돌 상태를 비교한다',
  categoryId: 'rect',
  source: { language: 'ts', code },
  runtimeSeed: seed,
};
