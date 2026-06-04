// Adapter Interop 예제 메타데이터
// adapter 함수로 SVG points / Float32Array / flat coord 외부 표현을 vectra 입력으로 읽고 직렬화한다
import type { PlaygroundExample } from '@repo/playground';
import type { CanvasRuntimeSeed } from '../../canvas/api';
import code from './source.exam.ts?raw';

/** Adapter Interop 예제의 runtimeSeed */
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

/** Adapter Interop 예제 */
export const adapterInteropExample: PlaygroundExample<CanvasRuntimeSeed> = {
  id: 'adapter-interop',
  title: 'Adapter Interop',
  description:
    '같은 polygon을 SVG points 문자열과 Float32Array 두 외부 표현에서 읽어 동일 도형으로 그리고, flat coord에 matrix를 적용한 변환 결과를 원본 위에 겹쳐 보인다. 외부 객체를 vectra 전용 타입으로 변환하지 않고 그대로 계산하는 핵심 철학을 시연하는 adapter domain 전용 첫 예제',
  categoryId: 'transform',
  source: { language: 'ts', code },
  runtimeSeed: seed,
};
