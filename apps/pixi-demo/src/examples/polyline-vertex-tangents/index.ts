import type { PlaygroundExample } from '@repo/playground';
import type { PixiRuntimeSeed } from '../../pixi/api';
import code from './source.exam.ts?raw';

/** Polyline Vertex Tangents 예제의 runtimeSeed */
const seed: PixiRuntimeSeed = {
  size: { width: 720, height: 440 },
  pointer: { x: 380, y: 250 },
  segment: { a: { x: 0, y: 0 }, b: { x: 0, y: 0 } },
  circle: { center: { x: 0, y: 0 }, radius: 0 },
};

/** Polyline Vertex Tangents 예제 */
export const polylineVertexTangentsExample: PlaygroundExample<PixiRuntimeSeed> = {
  id: 'polyline-vertex-tangents',
  title: 'Polyline Vertex Tangents',
  description: 'apex vertex를 drag해 경로 모양을 바꾸면 각 vertex의 진행 방향(tangent) 화살표가 다시 정렬된다',
  categoryId: 'path',
  source: { language: 'ts', code },
  runtimeSeed: seed,
};
