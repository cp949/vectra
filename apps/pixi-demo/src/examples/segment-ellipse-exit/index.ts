import type { PlaygroundExample } from '@repo/playground';
import type { PixiRuntimeSeed } from '../../pixi/api';
import code from './source.exam.ts?raw';

/** Segment Ellipse Exit 예제의 runtimeSeed */
const seed: PixiRuntimeSeed = {
  size: { width: 720, height: 460 },
  pointer: { x: 620, y: 150 },
  segment: { a: { x: 0, y: 0 }, b: { x: 0, y: 0 } },
  circle: { center: { x: 0, y: 0 }, radius: 0 },
};

/** Segment Ellipse Exit 예제 */
export const segmentEllipseExitExample: PlaygroundExample<PixiRuntimeSeed> = {
  id: 'segment-ellipse-exit',
  title: 'Segment Ellipse Exit',
  description:
    '타원 내부에 한쪽 끝이 고정된 선분의 바깥 끝을 드래그하면 선분이 타원 경계를 통과하는 단일 exit point가 다시 계산된다 (singleIntersectionSegmentEllipse semantic)',
  categoryId: 'ellipse',
  source: { language: 'ts', code },
  runtimeSeed: seed,
};
