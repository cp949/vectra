// Random Boundary Sampling 예제 메타데이터
// seeded RNG로 area sampler와 boundary sampler를 정적으로 비교한다
import type { PlaygroundExample } from '@repo/playground';
import type { CanvasRuntimeSeed } from '../../canvas/api';
import code from './source.exam.ts?raw';

/** Random Boundary Sampling 예제의 runtimeSeed */
const seed: CanvasRuntimeSeed = {
  size: { width: 760, height: 440 },
  pointer: { x: 0, y: 0 },
  segment: { a: { x: 0, y: 0 }, b: { x: 0, y: 0 } },
  rect: { x: 0, y: 0, width: 0, height: 0 },
  bounds: { min: { x: 0, y: 0 }, max: { x: 0, y: 0 } },
  circle: { center: { x: 0, y: 0 }, radius: 0 },
  polygon: [],
  matrix: { a: 1, b: 0, c: 0, d: 1, tx: 0, ty: 0 },
};

/** Random Boundary Sampling 예제 */
export const randomBoundarySamplingExample: PlaygroundExample<CanvasRuntimeSeed> = {
  id: 'random-boundary-sampling',
  title: 'Random Boundary Sampling',
  description:
    'seeded RNG로 triangle/ellipse 내부 area sample과 polyline/path 위 boundary sample을 재현 가능하게 비교한다',
  categoryId: 'random',
  source: { language: 'ts', code },
  runtimeSeed: seed,
};
