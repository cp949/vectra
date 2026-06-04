import type { PlaygroundExample } from '@repo/playground';
import type { PixiRuntimeSeed } from '../../pixi/api';
import code from './source.exam.ts?raw';

/** Angle Directed Sweep 예제의 runtimeSeed */
const seed: PixiRuntimeSeed = {
  size: { width: 720, height: 440 },
  pointer: { x: 520, y: 130 },
  segment: { a: { x: 0, y: 0 }, b: { x: 0, y: 0 } },
  circle: { center: { x: 0, y: 0 }, radius: 0 },
};

/** Angle Directed Sweep 예제 */
export const angleDirectedSweepExample: PlaygroundExample<PixiRuntimeSeed> = {
  id: 'angle-directed-sweep',
  title: 'Angle Directed Sweep',
  description:
    '끝 ray 핸들을 피벗 둘레로 drag하면 sweepAngle이 고정 시작 ray에서 끝 ray까지 CCW 방향으로 휩쓴 회전량을 [0, 2π)로 다시 구해 그만큼 wedge를 채운다. sweep이 180°(π)를 넘으면 isReflexSweep가 major arc로 판정해 강조 색으로 바뀐다',
  categoryId: 'angle',
  source: { language: 'ts', code },
  runtimeSeed: seed,
};
