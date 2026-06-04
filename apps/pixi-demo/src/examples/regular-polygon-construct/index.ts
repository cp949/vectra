import type { PlaygroundExample } from '@repo/playground';
import type { PixiRuntimeSeed } from '../../pixi/api';
import code from './source.exam.ts?raw';

/** Regular Polygon Construct 예제의 runtimeSeed */
const seed: PixiRuntimeSeed = {
  size: { width: 720, height: 440 },
  pointer: { x: 360, y: 80 },
  segment: { a: { x: 0, y: 0 }, b: { x: 0, y: 0 } },
  circle: { center: { x: 360, y: 250 }, radius: 130 },
};

/** Regular Polygon Construct 예제 */
export const regularPolygonConstructExample: PlaygroundExample<PixiRuntimeSeed> = {
  id: 'regular-polygon-construct',
  title: 'Regular Polygon Construct',
  description:
    '슬라이더로 변 수 N을 정하면 regularPolygon(center, R, N)이 고정 외접원 위에 정 N각형 꼭짓점을 구성해 다시 그린다',
  categoryId: 'polygon',
  source: { language: 'ts', code },
  runtimeSeed: seed,
};
