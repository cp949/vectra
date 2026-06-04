import type { PlaygroundExample } from '@repo/playground';
import type { PixiRuntimeSeed } from '../../pixi/api';
import code from './source.exam.ts?raw';

/** Triangle Medians Concurrency 예제의 runtimeSeed */
const seed: PixiRuntimeSeed = {
  size: { width: 720, height: 440 },
  pointer: { x: 360, y: 240 },
  segment: { a: { x: 230, y: 100 }, b: { x: 560, y: 250 } },
  circle: { center: { x: 330, y: 243 }, radius: 6 },
};

/** Triangle Medians Concurrency 예제 */
export const triangleMediansConcurrencyExample: PlaygroundExample<PixiRuntimeSeed> = {
  id: 'triangle-medians-concurrency',
  title: 'Triangle Medians Concurrency',
  description: '꼭짓점을 드래그하면 세 중선이 무게중심에서 만나 각 중선을 2:1로 나누는 것을 보인다',
  categoryId: 'triangle',
  source: { language: 'ts', code },
  runtimeSeed: seed,
};
