import type { PlaygroundExample } from '@repo/playground';
import type { PixiRuntimeSeed } from '../../pixi/api';
import code from './source.exam.ts?raw';

/** Inverse Lerp Track 예제의 runtimeSeed */
const seed: PixiRuntimeSeed = {
  size: { width: 720, height: 440 },
  pointer: { x: 360, y: 220 },
  segment: { a: { x: 0, y: 0 }, b: { x: 0, y: 0 } },
  circle: { center: { x: 0, y: 0 }, radius: 0 },
};

/** Inverse Lerp Track 예제 */
export const inverseLerpTrackExample: PlaygroundExample<PixiRuntimeSeed> = {
  id: 'inverse-lerp-track',
  title: 'Inverse Lerp Track',
  description: 'probe를 구간 [A, B] 위에서 drag하면 값이 구간에서 차지하는 비율 t를 0~1로 역보간한다',
  categoryId: 'math',
  source: { language: 'ts', code },
  runtimeSeed: seed,
};
