import type { PlaygroundExample } from '@repo/playground';
import type { PixiRuntimeSeed } from '../../pixi/api';
import code from './source.exam.ts?raw';

/** Segment From Circle 예제의 runtimeSeed */
const seed: PixiRuntimeSeed = {
  size: { width: 720, height: 440 },
  pointer: { x: 540, y: 220 },
  segment: { a: { x: 0, y: 0 }, b: { x: 0, y: 0 } },
  circle: { center: { x: 360, y: 220 }, radius: 150 },
};

/** Segment From Circle 예제 */
export const segmentFromCircleExample: PlaygroundExample<PixiRuntimeSeed> = {
  id: 'segment-from-circle',
  title: 'Segment From Circle',
  description:
    'angle 핸들을 drag하면 고정 원의 중심을 지나는 지름 선분을 그 angle 방향으로 다시 구성하고, 두 끝점이 항상 원 위에 있고 중심이 중점임을 보인다',
  categoryId: 'segment',
  source: { language: 'ts', code },
  runtimeSeed: seed,
};
