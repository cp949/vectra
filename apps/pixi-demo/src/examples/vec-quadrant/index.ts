import type { PlaygroundExample } from '@repo/playground';
import type { PixiRuntimeSeed } from '../../pixi/api';
import code from './source.exam.ts?raw';

/** Vector Quadrant 예제의 runtimeSeed */
const seed: PixiRuntimeSeed = {
  size: { width: 720, height: 440 },
  pointer: { x: 510, y: 110 },
  segment: { a: { x: 0, y: 0 }, b: { x: 0, y: 0 } },
  circle: { center: { x: 0, y: 0 }, radius: 0 },
};

/** Vector Quadrant 예제 */
export const vecQuadrantExample: PlaygroundExample<PixiRuntimeSeed> = {
  id: 'vec-quadrant',
  title: 'Vector Quadrant',
  description: 'probe를 drag하면 원점→probe 벡터가 몇 사분면(Ⅰ~Ⅳ)에 있는지 quadrant로 분류하고 해당 영역을 강조한다',
  categoryId: 'vector',
  source: { language: 'ts', code },
  runtimeSeed: seed,
};
