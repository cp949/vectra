// Quick Start 예제 소스
// Point와 재사용 출력 객체에 벡터 연산을 적용하고 Canvas에 그린다
import type { PlaygroundExample } from '@repo/playground';
import type { CanvasRuntimeSeed } from '../../canvas/api';
import code from './source.exam.ts?raw';

/** Quick Start 예제의 runtimeSeed */
const seed: CanvasRuntimeSeed = {
  size: { width: 600, height: 400 },
  pointer: { x: 0, y: 0 },
  segment: { x1: 0, y1: 0, x2: 0, y2: 0 },
  rect: { x: 0, y: 0, width: 0, height: 0 },
  bounds: { minX: 0, minY: 0, maxX: 0, maxY: 0 },
  circle: { cx: 0, cy: 0, r: 0 },
  polygon: [],
  matrix: { a: 1, b: 0, c: 0, d: 1, tx: 0, ty: 0 },
};

/** Quick Start 예제 */
export const quickStartExample: PlaygroundExample<CanvasRuntimeSeed> = {
  id: 'quick-start',
  title: 'Quick Start',
  description: 'Point와 Into 함수 기본 사용법',
  categoryId: 'getting-started',
  source: { language: 'ts', code },
  runtimeSeed: seed,
};
