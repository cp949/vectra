import { lineFamilyTriangleIntersectionPoint, segmentToLineFamilyParam } from '../internal/line-family';
import { DEFAULT_EPSILON } from '../internal/numeric';
import { readSegmentA, readSegmentB } from '../internal/segment';
import { readTriangleRawCoords } from '../internal/triangle';
import { readX, readY } from '../internal/xy';
import type { SegmentLike, TriangleLike, XYWritable } from '../types';

/**
 * segment와 triangle의 단일 교점을 out에 기록하고 true를 반환한다.
 *
 * 교점이 2개 이상이면 false를 반환하고 out을 수정하지 않는다.
 * degenerate triangle (세 꼭짓점이 collinear) 또는 zero-length segment이면 false.
 *
 * @param out 교점 좌표를 기록할 writable output
 * @param line 교점을 구할 segment
 * @param triangle 교점을 구할 triangle
 * @param epsilon 수치 비교 tolerance
 */
export function singleIntersectionSegmentTriangleInto(
  out: XYWritable,
  line: SegmentLike,
  triangle: TriangleLike,
  epsilon = DEFAULT_EPSILON
): boolean {
  const a = readSegmentA(line);
  const b = readSegmentB(line);
  const lineParam = segmentToLineFamilyParam(readX(a), readY(a), readX(b), readY(b));
  const { ax, ay, bx, by, cx, cy } = readTriangleRawCoords(triangle);
  return lineFamilyTriangleIntersectionPoint(out, lineParam, ax, ay, bx, by, cx, cy, epsilon);
}
