import { lineFamilyBoxIntersectionPoint, segmentToLineFamilyParam } from '../internal/line-family';
import { DEFAULT_EPSILON } from '../internal/numeric';
import { readRectHeight, readRectWidth, readRectX, readRectY } from '../internal/rect';
import { readSegmentA, readSegmentB } from '../internal/segment';
import { readX, readY } from '../internal/xy';
import type { RectLike, SegmentLike, XYWritable } from '../types';

/**
 * segment와 rect의 단일 교점을 out에 기록하고 true를 반환한다.
 *
 * 교점이 2개 이상이거나 collinear이면 false를 반환하고 out을 수정하지 않는다.
 * empty rect (width ≤ 0 또는 height ≤ 0) 또는 zero-length segment이면 false.
 *
 * @param out 교점 좌표를 기록할 writable output
 * @param line 교점을 구할 segment
 * @param rect 교점을 구할 rect
 * @param epsilon 수치 비교 tolerance
 */
export function singleIntersectionSegmentRectInto(
  out: XYWritable,
  line: SegmentLike,
  rect: RectLike,
  epsilon = DEFAULT_EPSILON
): boolean {
  const rw = readRectWidth(rect);
  const rh = readRectHeight(rect);
  if (rw <= 0 || rh <= 0) return false;
  const a = readSegmentA(line);
  const b = readSegmentB(line);
  const lineParam = segmentToLineFamilyParam(readX(a), readY(a), readX(b), readY(b));
  const rx = readRectX(rect);
  const ry = readRectY(rect);
  return lineFamilyBoxIntersectionPoint(out, lineParam, rx, ry, rx + rw, ry + rh, epsilon);
}
