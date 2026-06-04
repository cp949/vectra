import type { PlaygroundExample } from '@repo/playground';
import type { PixiRuntimeSeed } from '../../pixi/api';
import code from './source.exam.ts?raw';

/** Segment Point At Length 예제의 runtimeSeed */
const seed: PixiRuntimeSeed = {
  size: { width: 720, height: 440 },
  pointer: { x: 360, y: 400 },
  segment: { a: { x: 180, y: 300 }, b: { x: 560, y: 150 } },
  circle: { center: { x: 0, y: 0 }, radius: 0 },
};

/** Segment Point At Length 예제 */
export const segmentPointAtLengthExample: PlaygroundExample<PixiRuntimeSeed> = {
  id: 'segment-point-at-length',
  title: 'Segment Point At Length',
  description:
    'distance scrubber를 drag하면 pointAtLength가 segment 시작점에서 그 거리만큼 떨어진 점을 둔다. 거리가 [0, length] 밖이면 clamp marker는 끝점에 멈추고, clamp:false ghost는 supporting line을 따라 연장된다',
  categoryId: 'segment',
  source: { language: 'ts', code },
  runtimeSeed: seed,
};
