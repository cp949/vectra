import type { PlaygroundExample } from '@repo/playground';
import type { PixiRuntimeSeed } from '../../pixi/api';
import code from './source.exam.ts?raw';

/** Arc Length Parameterize 예제의 runtimeSeed */
const seed: PixiRuntimeSeed = {
  size: { width: 720, height: 440 },
  pointer: { x: 620, y: 250 },
  segment: { a: { x: 0, y: 0 }, b: { x: 0, y: 0 } },
  circle: { center: { x: 0, y: 0 }, radius: 0 },
};

/** Arc Length Parameterize 예제 */
export const arcLengthParameterizeExample: PlaygroundExample<PixiRuntimeSeed> = {
  id: 'arc-length-parameterize',
  title: 'Arc Length Parameterize',
  description:
    'aspect knob으로 타원 호를 조절해 arc length 거리→파라미터 t 매핑이 비선형임을 등거리 marker와 ghost dot으로 드러낸다',
  categoryId: 'curve',
  source: { language: 'ts', code },
  runtimeSeed: seed,
};
