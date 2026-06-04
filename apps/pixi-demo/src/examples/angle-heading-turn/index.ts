import type { PlaygroundExample } from '@repo/playground';
import type { PixiRuntimeSeed } from '../../pixi/api';
import code from './source.exam.ts?raw';

/** Angle Heading Turn 예제의 runtimeSeed */
const seed: PixiRuntimeSeed = {
  size: { width: 720, height: 440 },
  pointer: { x: 360, y: 220 },
  segment: { a: { x: 0, y: 0 }, b: { x: 0, y: 0 } },
  circle: { center: { x: 0, y: 0 }, radius: 0 },
};

/** Angle Heading Turn 예제 */
export const angleHeadingTurnExample: PlaygroundExample<PixiRuntimeSeed> = {
  id: 'angle-heading-turn',
  title: 'Angle Heading Turn',
  description:
    'pointer 방향으로 회전하는 세 마커로 shortestLerpAngle / lerpAngle / moveTowardAngle 차이를 ±π wrap 경계에서 비교한다',
  categoryId: 'angle',
  source: { language: 'ts', code },
  runtimeSeed: seed,
};
