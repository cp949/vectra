import type { PlaygroundExample } from '@repo/playground';
import type { PixiRuntimeSeed } from '../../pixi/api';
import code from './source.exam.ts?raw';

/** Triangle From Segment Apex 예제의 runtimeSeed */
const seed: PixiRuntimeSeed = {
  size: { width: 720, height: 440 },
  pointer: { x: 360, y: 140 },
  segment: { a: { x: 230, y: 300 }, b: { x: 490, y: 300 } },
  circle: { center: { x: 0, y: 0 }, radius: 0 },
};

/** Triangle From Segment Apex 예제 */
export const triangleFromSegmentApexExample: PlaygroundExample<PixiRuntimeSeed> = {
  id: 'triangle-from-segment-apex',
  title: 'Triangle From Segment Apex',
  description:
    'apex 정점 handle을 자유롭게 drag하면 고정 밑변과 그 apex로 일반 삼각형이 구성되고, apex가 밑변 지지선 위에 오면 면적 0이 됨을 보인다',
  categoryId: 'triangle',
  source: { language: 'ts', code },
  runtimeSeed: seed,
};
