import type { PlaygroundExample } from '@repo/playground';
import type { PixiRuntimeSeed } from '../../pixi/api';
import code from './source.exam.ts?raw';

/** Segment Rotate Origin 예제의 runtimeSeed */
const seed: PixiRuntimeSeed = {
  size: { width: 720, height: 440 },
  pointer: { x: 0, y: 0 },
  segment: { a: { x: 0, y: 0 }, b: { x: 0, y: 0 } },
  circle: { center: { x: 0, y: 0 }, radius: 0 },
};

/** Segment Rotate Origin 예제 */
export const segmentRotateOriginExample: PlaygroundExample<PixiRuntimeSeed> = {
  id: 'segment-rotate-origin',
  title: 'Segment Rotate Origin',
  description:
    'angle handle을 drag하면 고정 base segment가 월드 원점(0,0) 기준으로 강체 회전하고, 길이는 상수로 유지된다',
  categoryId: 'segment',
  source: { language: 'ts', code },
  runtimeSeed: seed,
};
