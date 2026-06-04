import { readInfiniteLineDirection, readInfiniteLineOrigin } from '../internal/infinite-line';
import { infiniteLineToLineFamilyParam, lineFamilyTriangleIntersectionPoint } from '../internal/line-family';
import { DEFAULT_EPSILON } from '../internal/numeric';
import { readTriangleRawCoords } from '../internal/triangle';
import { readX, readY } from '../internal/xy';
import type { InfiniteLineLike, TriangleLike, XYWritable } from '../types';

/**
 * infinite-line과 triangle의 단일 교점을 out에 기록하고 true를 반환한다.
 *
 * 교점이 2개 이상이거나 degenerate triangle이면 false를 반환하고 out을 수정하지 않는다.
 */
export function singleIntersectionInfiniteLineTriangleInto(
  out: XYWritable,
  infiniteLine: InfiniteLineLike,
  triangle: TriangleLike,
  epsilon = DEFAULT_EPSILON
): boolean {
  const origin = readInfiniteLineOrigin(infiniteLine);
  const dir = readInfiniteLineDirection(infiniteLine);
  const lineParam = infiniteLineToLineFamilyParam(readX(origin), readY(origin), readX(dir), readY(dir));
  const { ax, ay, bx, by, cx, cy } = readTriangleRawCoords(triangle);
  return lineFamilyTriangleIntersectionPoint(out, lineParam, ax, ay, bx, by, cx, cy, epsilon);
}
