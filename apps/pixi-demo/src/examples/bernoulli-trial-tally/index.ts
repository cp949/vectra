import type { PlaygroundExample } from '@repo/playground';
import type { PixiRuntimeSeed } from '../../pixi/api';
import code from './source.exam.ts?raw';

/** Bernoulli Trial Tally 예제의 runtimeSeed */
const seed: PixiRuntimeSeed = {
  size: { width: 720, height: 440 },
  pointer: { x: 360, y: 220 },
  segment: { a: { x: 0, y: 0 }, b: { x: 0, y: 0 } },
  circle: { center: { x: 0, y: 0 }, radius: 0 },
};

/** Bernoulli Trial Tally 예제 */
export const bernoulliTrialTallyExample: PlaygroundExample<PixiRuntimeSeed> = {
  id: 'bernoulli-trial-tally',
  title: 'Bernoulli Trial Tally',
  description:
    'p knob으로 성공 확률을 정하면 누적 베르누이 시행의 경험적 성공 빈도가 p 기준선으로 수렴함을 tally bar로 보인다',
  categoryId: 'math',
  source: { language: 'ts', code },
  runtimeSeed: seed,
};
