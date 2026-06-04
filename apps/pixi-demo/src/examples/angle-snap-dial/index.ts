import type { PlaygroundExample } from '@repo/playground';
import type { PixiRuntimeSeed } from '../../pixi/api';
import code from './source.exam.ts?raw';

/** Angle Snap Dial 예제의 runtimeSeed */
const seed: PixiRuntimeSeed = {
  size: { width: 720, height: 440 },
  pointer: { x: 455, y: 270 },
  segment: { a: { x: 0, y: 0 }, b: { x: 0, y: 0 } },
  circle: { center: { x: 0, y: 0 }, radius: 0 },
};

/** Angle Snap Dial 예제 */
export const angleSnapDialExample: PlaygroundExample<PixiRuntimeSeed> = {
  id: 'angle-snap-dial',
  title: 'Angle Snap Dial',
  description:
    '피벗 둘레의 handle을 drag하면 snapAngle이 연속 각도를 가장 가까운 step 눈금(15°)으로 snap한 needle을 보인다. 에디터의 shift 회전 각도 스냅과 같은 흐름이다',
  categoryId: 'angle',
  source: { language: 'ts', code },
  runtimeSeed: seed,
};
