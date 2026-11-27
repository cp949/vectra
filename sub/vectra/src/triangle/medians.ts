import { createZeroSegment } from '../internal/segment';
import type { Triangle } from '../types/flat-shapes.internal';
import { mediansInto, type TriangleMediansWritable } from './medians-into';

/**
 * mediansInto의 allocating companion. triangle 세 vertex의 median segment를 담은 새 nested
 * plain object를 반환한다.
 *
 * 반환 object의 각 필드는 한 vertex의 median segment다.
 * - a: A → midpoint(BC)
 * - b: B → midpoint(CA)
 * - c: C → midpoint(AB)
 *
 * degenerate triangle도 midpoint 산식으로 세 segment를 만든다. 실패하지 않는다.
 * non-finite vertex 좌표는 검증 없이 JS 산술 결과를 그대로 반환한다.
 *
 *
 * tolerance/iteration option 정책은 `mediansInto`와 동일하다.
 * @param triangle median을 계산할 triangle
 */
export function medians(triangle: Triangle): TriangleMediansWritable {
  const out: TriangleMediansWritable = {
    a: createZeroSegment(),
    b: createZeroSegment(),
    c: createZeroSegment(),
  };
  return mediansInto(out, triangle);
}
