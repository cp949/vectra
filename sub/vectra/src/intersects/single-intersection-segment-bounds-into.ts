import { readBoundsMax, readBoundsMin } from '../internal/bounds';
import { lineFamilyBoxIntersectionPoint, segmentToLineFamilyParam } from '../internal/line-family';
import { DEFAULT_EPSILON } from '../internal/numeric';
import { readSegmentA, readSegmentB } from '../internal/segment';
import { readX, readY } from '../internal/xy';
import type { BoundsLike, SegmentLike, XYWritable } from '../types';

/**
 * segment와 bounds의 단일 교점을 out에 기록하고 true를 반환한다.
 *
 * 교점이 2개 이상이거나 collinear이면 false를 반환하고 out을 수정하지 않는다.
 * inverted bounds (max < min) 또는 zero-length segment이면 false.
 *
 * @param out 교점 좌표를 기록할 writable output
 * @param line 교점을 구할 segment
 * @param bounds 교점을 구할 bounds (axis-aligned)
 * @param epsilon 수치 비교 tolerance
 */
export function singleIntersectionSegmentBoundsInto(
  out: XYWritable,
  line: SegmentLike,
  bounds: BoundsLike,
  epsilon = DEFAULT_EPSILON
): boolean {
  const min = readBoundsMin(bounds);
  const max = readBoundsMax(bounds);
  const x0 = readX(min);
  const y0 = readY(min);
  const x1 = readX(max);
  const y1 = readY(max);
  if (x1 < x0 || y1 < y0) return false;
  const a = readSegmentA(line);
  const b = readSegmentB(line);
  const lineParam = segmentToLineFamilyParam(readX(a), readY(a), readX(b), readY(b));
  return lineFamilyBoxIntersectionPoint(out, lineParam, x0, y0, x1, y1, epsilon);
}
