import type { TriangleLike, TriangleWritable } from '../types';
import { medialTriangleInto } from './medial-triangle-into';

/**
 * medialTriangleInto의 allocating companion.
 * 세 side의 midpoint를 vertex로 하는 새 TriangleWritable을 반환한다.
 *
 * finite/non-finite 입력과 결과 처리 정책은 `medialTriangleInto`와 동일하다.
 * degenerate/empty 입력 처리 정책은 `medialTriangleInto`와 동일하다.
 * tolerance/iteration option 정책은 `medialTriangleInto`와 동일하다.
 */
export function medialTriangle(triangle: TriangleLike): TriangleWritable {
  const out: TriangleWritable = {
    a: { x: 0, y: 0 },
    b: { x: 0, y: 0 },
    c: { x: 0, y: 0 },
  };
  return medialTriangleInto(out, triangle);
}
