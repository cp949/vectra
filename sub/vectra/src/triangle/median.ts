import { createZeroSegment } from '../internal/segment';
import type { SegmentWritable, Triangle } from '../types/flat-shapes.internal';
import { medianInto, type TriangleVertexKey } from './median-into';

/**
 * medianInto의 allocating companion. triangle vertex에서 맞은편 side midpoint로 향하는 median
 * segment를 새 SegmentWritable로 반환한다.
 *
 * vertex semantics:
 * - 'a': vertex A → midpoint(BC)
 * - 'b': vertex B → midpoint(CA)
 * - 'c': vertex C → midpoint(AB)
 *
 * runtime invalid vertex key는 undefined를 반환한다.
 * degenerate triangle도 midpoint 산식으로 segment를 만든다.
 * non-finite vertex 좌표는 검증 없이 JS 산술 결과를 그대로 반환한다.
 *
 *
 * tolerance/iteration option 정책은 `medianInto`와 동일하다.
 * @param triangle median을 계산할 triangle
 * @param vertex source vertex key. 'a' | 'b' | 'c' 외 값은 undefined 반환.
 */
export function median(triangle: Triangle, vertex: TriangleVertexKey): SegmentWritable | undefined {
  const seed = createZeroSegment();
  if (medianInto(seed, triangle, vertex) === false) return undefined;
  return seed;
}
