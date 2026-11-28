// Random Sampling 예제 소스
// injected rng를 사용하여 polygon 내부에 랜덤 점을 샘플링한다
import type { PlaygroundExample } from '@repo/playground';
import type { CanvasRuntimeSeed } from '../../canvas/api';
import code from './source.exam.ts?raw';

/** Random Sampling 예제의 runtimeSeed */
const seed: CanvasRuntimeSeed = {
  size: { width: 600, height: 400 },
  pointer: { x: 0, y: 0 },
  segment: { x1: 0, y1: 0, x2: 0, y2: 0 },
  rect: { x: 0, y: 0, width: 0, height: 0 },
  bounds: { minX: 80, minY: 60, maxX: 520, maxY: 340 },
  circle: { cx: 300, cy: 200, r: 60 },
  polygon: [150, 80, 350, 60, 460, 180, 400, 320, 200, 340, 100, 240],
  matrix: { a: 1, b: 0, c: 0, d: 1, tx: 0, ty: 0 },
  randomSeed: 20260517,
};

/** Random Sampling 예제 */
export const randomSamplingExample: PlaygroundExample<CanvasRuntimeSeed> = {
  id: 'random-sampling',
  title: 'Random Sampling',
  description: 'seeded rng와 polygon predicate를 조합한 rejection sampling (seed: 20260517)',
  categoryId: 'random',
  source: { language: 'ts', code },
  runtimeSeed: seed,
};
