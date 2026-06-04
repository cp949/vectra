// Random Sampling 예제 소스
// injected rng를 사용하여 polygon 내부에 랜덤 점을 샘플링한다
import type { PlaygroundExample } from '@repo/playground';
import type { CanvasRuntimeSeed } from '../../canvas/api';
import code from './source.exam.ts?raw';

/** Random Sampling 예제의 runtimeSeed */
const seed: CanvasRuntimeSeed = {
  size: { width: 600, height: 400 },
  pointer: { x: 0, y: 0 },
  segment: { a: { x: 0, y: 0 }, b: { x: 0, y: 0 } },
  rect: { x: 0, y: 0, width: 0, height: 0 },
  bounds: { min: { x: 80, y: 60 }, max: { x: 520, y: 340 } },
  circle: { center: { x: 300, y: 200 }, radius: 60 },
  polygon: [
    { x: 150, y: 80 },
    { x: 350, y: 60 },
    { x: 460, y: 180 },
    { x: 400, y: 320 },
    { x: 200, y: 340 },
    { x: 100, y: 240 },
  ],
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
