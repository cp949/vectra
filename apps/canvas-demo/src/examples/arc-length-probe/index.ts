// Arc Length Probe 예제 메타데이터
// center form arc의 length sample, tangent/normal, closest point를 정적으로 그린다
import type { PlaygroundExample } from '@repo/playground';
import type { CanvasRuntimeSeed } from '../../canvas/api';
import code from './source.exam.ts?raw';

/** Arc Length Probe 예제의 runtimeSeed */
const seed: CanvasRuntimeSeed = {
  size: { width: 760, height: 440 },
  pointer: { x: 0, y: 0 },
  segment: { a: { x: 0, y: 0 }, b: { x: 0, y: 0 } },
  rect: { x: 0, y: 0, width: 0, height: 0 },
  bounds: { min: { x: 0, y: 0 }, max: { x: 0, y: 0 } },
  circle: { center: { x: 0, y: 0 }, radius: 0 },
  polygon: [],
  matrix: { a: 1, b: 0, c: 0, d: 1, tx: 0, ty: 0 },
};

/** Arc Length Probe 예제 */
export const arcLengthProbeExample: PlaygroundExample<CanvasRuntimeSeed> = {
  id: 'arc-length-probe',
  title: 'Arc Length Probe',
  description:
    'center form arc에서 t 기반 위치와 length 기반 위치를 비교하고 tangent, normal, closest point, bounds를 한 장면에 표시한다',
  categoryId: 'curve',
  source: { language: 'ts', code },
  runtimeSeed: seed,
};
