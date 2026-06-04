import type { PlaygroundExample } from '@repo/playground';
import type { PixiRuntimeSeed } from '../../pixi/api';
import code from './source.exam.ts?raw';

/** Star Polygon Spikes 예제의 runtimeSeed */
const seed: PixiRuntimeSeed = {
  size: { width: 720, height: 440 },
  pointer: { x: 360, y: 250 },
  segment: { a: { x: 0, y: 0 }, b: { x: 0, y: 0 } },
  circle: { center: { x: 0, y: 0 }, radius: 0 },
};

/** Star Polygon Spikes 예제 */
export const starPolygonSpikesExample: PlaygroundExample<PixiRuntimeSeed> = {
  id: 'star-polygon-spikes',
  title: 'Star Polygon Spikes',
  description:
    '슬라이더로 inner 반지름 비율을 정하면 같은 외접원·고정 꼭짓점 수에서 starPolygon이 outer/inner 교차 꼭짓점으로 별 외곽선을 다시 구성한다',
  categoryId: 'polygon',
  source: { language: 'ts', code },
  runtimeSeed: seed,
};
