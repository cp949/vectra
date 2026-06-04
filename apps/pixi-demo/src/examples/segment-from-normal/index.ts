import type { PlaygroundExample } from '@repo/playground';
import type { PixiRuntimeSeed } from '../../pixi/api';
import code from './source.exam.ts?raw';

/** Segment From Normal 예제의 runtimeSeed */
const seed: PixiRuntimeSeed = {
  size: { width: 720, height: 440 },
  pointer: { x: 470, y: 150 },
  segment: { a: { x: 0, y: 0 }, b: { x: 0, y: 0 } },
  circle: { center: { x: 0, y: 0 }, radius: 0 },
};

/** Segment From Normal 예제 */
export const segmentFromNormalExample: PlaygroundExample<PixiRuntimeSeed> = {
  id: 'segment-from-normal',
  title: 'Segment From Normal',
  description:
    'tip 핸들을 drag하면 고정 base segment 위 foot에서 base에 직각인 rib를 다시 구성하고, rib가 항상 base에 수직임을 보인다',
  categoryId: 'segment',
  source: { language: 'ts', code },
  runtimeSeed: seed,
};
