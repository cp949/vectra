// Quick Start 예제 소스
// XYInput tuple과 object 양쪽에서 addInto / scaleInto를 사용하고 Canvas에 그린다
import type { PlaygroundExample } from '@repo/playground';
import type { CanvasRuntimeSeed } from '../../canvas/api';
import code from './source.exam.ts?raw';

/** Quick Start 예제의 runtimeSeed */
const seed: CanvasRuntimeSeed = {
  size: { width: 600, height: 400 },
  pointer: { x: 0, y: 0 },
  segment: { a: { x: 0, y: 0 }, b: { x: 0, y: 0 } },
  rect: { x: 0, y: 0, width: 0, height: 0 },
  bounds: { min: { x: 0, y: 0 }, max: { x: 0, y: 0 } },
  circle: { center: { x: 0, y: 0 }, radius: 0 },
  polygon: [],
  matrix: { a: 1, b: 0, c: 0, d: 1, tx: 0, ty: 0 },
};

/** Quick Start 예제 */
export const quickStartExample: PlaygroundExample<CanvasRuntimeSeed> = {
  id: 'quick-start',
  title: 'Quick Start',
  description: 'XYInput tuple/object와 Into 함수 기본 사용법',
  categoryId: 'getting-started',
  source: { language: 'ts', code },
  runtimeSeed: seed,
};
