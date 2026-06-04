import { createSegment } from '../segment/create-segment';
import type { SegmentWritable, TriangleLike } from '../types';
import { eulerLineInto } from './euler-line-into';

/**
 * eulerLineInto의 allocating companion.
 *
 * triangle의 Euler line을 SegmentWritable로 반환한다. a는 centroid, b는 orthocenter다.
 * degenerate triangle(collinear / single-point)이거나 non-finite vertex이면 undefined를 반환한다.
 * 정삼각형처럼 centroid와 orthocenter가 일치하면 zero-length segment를 반환한다.
 * 실패 정책은 eulerLineInto와 동일하다.
 *
 * @param triangle Euler line을 계산할 triangle
 */
export function eulerLine(triangle: TriangleLike): SegmentWritable | undefined {
  const seed = createSegment();
  if (!eulerLineInto(seed, triangle)) return undefined;
  return seed;
}
