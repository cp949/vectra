import type { PlaygroundExample } from '@repo/playground';
import type { PixiRuntimeSeed } from '../../pixi/api';
import code from './source.exam.ts?raw';

/** Normal Distribution Histogram 예제의 runtimeSeed */
const seed: PixiRuntimeSeed = {
  size: { width: 720, height: 440 },
  pointer: { x: 360, y: 220 },
  segment: { a: { x: 0, y: 0 }, b: { x: 0, y: 0 } },
  circle: { center: { x: 0, y: 0 }, radius: 0 },
};

/** Normal Distribution Histogram 예제 */
export const normalDistributionHistogramExample: PlaygroundExample<PixiRuntimeSeed> = {
  id: 'normal-distribution-histogram',
  title: 'Normal Distribution Histogram',
  description:
    'seed 고정 RNG로 뽑은 정규분포 샘플 히스토그램을 mean/stddev handle로 이동·확대하고 stddev=0 spike 정책을 드러낸다',
  categoryId: 'math',
  source: { language: 'ts', code },
  runtimeSeed: seed,
};
