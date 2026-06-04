import type { PlaygroundExample } from '@repo/playground';
import type { PixiRuntimeSeed } from '../../pixi/api';
import code from './source.exam.ts?raw';

/** Triangle From Segment Height 예제의 runtimeSeed */
const seed: PixiRuntimeSeed = {
  size: { width: 720, height: 440 },
  pointer: { x: 360, y: 120 },
  segment: { a: { x: 220, y: 250 }, b: { x: 500, y: 250 } },
  circle: { center: { x: 0, y: 0 }, radius: 0 },
};

/** Triangle From Segment Height 예제 */
export const triangleFromSegmentHeightExample: PlaygroundExample<PixiRuntimeSeed> = {
  id: 'triangle-from-segment-height',
  title: 'Triangle From Segment Height',
  description:
    'apex handle을 base에 수직인 축으로 drag하면 밑변과 높이로 이등변 삼각형이 구성되고 두 다리가 항상 같은 길이임을 보인다',
  categoryId: 'triangle',
  source: { language: 'ts', code },
  runtimeSeed: seed,
};
