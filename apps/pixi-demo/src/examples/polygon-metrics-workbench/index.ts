import type { PlaygroundExample } from '@repo/playground';
import type { PixiRuntimeSeed } from '../../pixi/api';
import code from './source.exam.ts?raw';

/** Polygon Metrics Workbench 예제의 runtimeSeed */
const seed: PixiRuntimeSeed = {
  size: { width: 760, height: 460 },
  pointer: { x: 410, y: 240 },
  segment: { a: { x: 180, y: 160 }, b: { x: 560, y: 300 } },
  circle: { center: { x: 380, y: 230 }, radius: 120 },
};

/** Polygon Metrics Workbench 예제 */
export const polygonMetricsWorkbenchExample: PlaygroundExample<PixiRuntimeSeed> = {
  id: 'polygon-metrics-workbench',
  title: 'Polygon Metrics Workbench',
  description: 'polygon 꼭짓점과 probe 점을 드래그해 내부, 경계, 외부 분류를 확인한다',
  categoryId: 'polygon',
  source: { language: 'ts', code },
  runtimeSeed: seed,
};
