import type { PlaygroundExample } from '@repo/playground';
import type { PixiRuntimeSeed } from '../../pixi/api';
import code from './source.exam.ts?raw';

/** Polyline Distance Probe 예제의 runtimeSeed */
const seed: PixiRuntimeSeed = {
  size: { width: 720, height: 440 },
  pointer: { x: 360, y: 60 },
  segment: { a: { x: 0, y: 0 }, b: { x: 0, y: 0 } },
  circle: { center: { x: 0, y: 0 }, radius: 0 },
};

/** Polyline Distance Probe 예제 */
export const polylineDistanceProbeExample: PlaygroundExample<PixiRuntimeSeed> = {
  id: 'polyline-distance-probe',
  title: 'Polyline Distance Probe',
  description:
    '고정 polyline에 probe를 drag하면 최단 거리를 재고 threshold 이하이면 stroke를 hit로 강조한다(proximity hit-test)',
  categoryId: 'path',
  source: { language: 'ts', code },
  runtimeSeed: seed,
};
