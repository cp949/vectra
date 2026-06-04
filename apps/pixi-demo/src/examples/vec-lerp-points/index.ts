import type { PlaygroundExample } from '@repo/playground';
import type { PixiRuntimeSeed } from '../../pixi/api';
import code from './source.exam.ts?raw';

/** Vector Point Lerp 예제의 runtimeSeed */
const seed: PixiRuntimeSeed = {
  size: { width: 720, height: 440 },
  pointer: { x: 540, y: 150 },
  segment: { a: { x: 0, y: 0 }, b: { x: 0, y: 0 } },
  circle: { center: { x: 0, y: 0 }, radius: 0 },
};

/** Vector Point Lerp 예제 */
export const vecLerpPointsExample: PlaygroundExample<PixiRuntimeSeed> = {
  id: 'vec-lerp-points',
  title: 'Vector Point Lerp',
  description: '끝점 A·B를 drag하면 보간점이 직선 A→B를 일정 속도로 왕복하고 등간격 t가 등거리로 놓인다',
  categoryId: 'vector',
  source: { language: 'ts', code },
  runtimeSeed: seed,
};
