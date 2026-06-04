import type { SegmentLike, TriangleWritable, XYInput } from '../types';
import { fromSegmentApexInto } from './from-segment-apex-into';

/**
 * fromSegmentApexInto의 allocating companion. 새 TriangleWritable을 반환한다.
 *
 * 좌표 정의는 `fromSegmentApexInto`와 동일하다.
 * zero-length base는 degenerate triangle로 기록한다.
 * NaN/Infinity 좌표는 validation 없이 그대로 기록한다.
 *
 * @param base 첫 두 vertex로 쓸 segment input
 * @param apex 세 번째 vertex point
 */
export function fromSegmentApex(base: SegmentLike, apex: XYInput): TriangleWritable {
  const out: TriangleWritable = {
    a: { x: 0, y: 0 },
    b: { x: 0, y: 0 },
    c: { x: 0, y: 0 },
  };
  return fromSegmentApexInto(out, base, apex);
}
