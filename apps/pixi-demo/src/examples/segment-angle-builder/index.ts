import type { PlaygroundExample } from '@repo/playground';
import type { PixiRuntimeSeed } from '../../pixi/api';
import code from './source.exam.ts?raw';

/** Segment Angle Builder 예제의 runtimeSeed */
const seed: PixiRuntimeSeed = {
  size: { width: 720, height: 440 },
  pointer: { x: 480, y: 150 },
  segment: { a: { x: 160, y: 220 }, b: { x: 380, y: 140 } },
  circle: { center: { x: 470, y: 220 }, radius: 24 },
};

/** Segment Angle Builder 예제 */
export const segmentAngleBuilderExample: PlaygroundExample<PixiRuntimeSeed> = {
  id: 'segment-angle-builder',
  title: 'Segment Angle Builder',
  description: '방향 handle을 드래그해 angle/length 기반 segment와 midpoint anchor 정렬 결과를 갱신한다',
  categoryId: 'segment',
  source: { language: 'ts', code },
  runtimeSeed: seed,
};
