import type { PlaygroundExample } from '@repo/playground';
import type { PixiRuntimeSeed } from '../../pixi/api';
import code from './source.exam.ts?raw';

/** Segment From Midpoint 예제의 runtimeSeed */
const seed: PixiRuntimeSeed = {
  size: { width: 720, height: 440 },
  pointer: { x: 510, y: 145 },
  segment: { a: { x: 0, y: 0 }, b: { x: 0, y: 0 } },
  circle: { center: { x: 0, y: 0 }, radius: 0 },
};

/** Segment From Midpoint 예제 */
export const segmentFromMidpointExample: PlaygroundExample<PixiRuntimeSeed> = {
  id: 'segment-from-midpoint',
  title: 'Segment From Midpoint',
  description:
    'endpoint 핸들을 drag하면 고정 pivot을 중심으로 양쪽 대칭으로 뻗는 막대를 다시 구성하고, pivot이 곧 두 끝점의 중점임을 보인다',
  categoryId: 'segment',
  source: { language: 'ts', code },
  runtimeSeed: seed,
};
