import { lineFamilyTriangleIntersectionPoint, segmentToLineFamilyParam } from '../internal/line-family';
import { DEFAULT_EPSILON } from '../internal/numeric';
import { readSegmentA, readSegmentB } from '../internal/segment';
import { readTriangleRawCoords } from '../internal/triangle';
import { readX, readY } from '../internal/xy';
import type { SegmentLike, TriangleLike, XYObjectWritable } from '../types';

/**
 * segment와 triangle의 단일 교점을 새 object로 반환한다.
 *
 * 교점이 없거나 2개 이상이면 undefined를 반환한다.
 * degenerate triangle (세 꼭짓점이 collinear) 또는 zero-length segment이면 undefined.
 * allocating companion — internal helper를 직접 호출한다.
 *
 * @param line 교점을 구할 segment
 * @param triangle 교점을 구할 triangle
 * @param epsilon 수치 비교 tolerance
 */
export function singleIntersectionSegmentTriangle(
  line: SegmentLike,
  triangle: TriangleLike,
  epsilon = DEFAULT_EPSILON
): XYObjectWritable | undefined {
  const a = readSegmentA(line);
  const b = readSegmentB(line);
  const lineParam = segmentToLineFamilyParam(readX(a), readY(a), readX(b), readY(b));
  const { ax, ay, bx, by, cx, cy } = readTriangleRawCoords(triangle);
  const out: XYObjectWritable = { x: 0, y: 0 };
  return lineFamilyTriangleIntersectionPoint(out, lineParam, ax, ay, bx, by, cx, cy, epsilon) ? out : undefined;
}
