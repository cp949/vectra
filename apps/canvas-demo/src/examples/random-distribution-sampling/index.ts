// Random Distribution Sampling 예제 메타데이터
// seeded RNG로 4개 패널에서 rect/circle/circle경계/polygon 내부 점 분포를 정적으로 그린다
import type { PlaygroundExample } from '@repo/playground';
import type { CanvasRuntimeSeed } from '../../canvas/api';
import code from './source.exam.ts?raw';

/** Random Distribution Sampling 예제의 runtimeSeed
 * randomSeed를 생략한다 — draw 내부에서 Random.createRng로 패널별 독립 RNG를 생성하므로
 * runtime.rng를 사용하지 않는다.
 */
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

/** Random Distribution Sampling 예제 */
export const randomDistributionSamplingExample: PlaygroundExample<CanvasRuntimeSeed> = {
  id: 'random-distribution-sampling',
  title: 'Random Distribution Sampling',
  description: 'seeded RNG로 rect/circle/circle경계/polygon 4개 패널에 균등 분포 점을 재현 가능하게 그린다',
  categoryId: 'random',
  source: { language: 'ts', code },
  runtimeSeed: seed,
};
