import type { PlaygroundExample } from '@repo/playground';
import type { PixiRuntimeSeed } from '../../pixi/api';
import code from './source.exam.ts?raw';

/** Segment Offset Normal Lab 예제의 runtimeSeed */
const seed: PixiRuntimeSeed = {
  size: { width: 720, height: 440 },
  pointer: { x: 360, y: 220 },
  segment: { a: { x: 150, y: 260 }, b: { x: 470, y: 170 } },
  circle: { center: { x: 360, y: 220 }, radius: 80 },
};

/** Segment Offset Normal Lab 예제 */
export const segmentOffsetNormalLabExample: PlaygroundExample<PixiRuntimeSeed> = {
  id: 'segment-offset-normal-lab',
  title: 'Segment Offset Normal Lab',
  description: '끝점과 offset 핸들을 드래그해 segment의 법선 offset, projection, 연장, 회전 preview를 비교한다',
  categoryId: 'segment',
  source: { language: 'ts', code },
  runtimeSeed: seed,
};
