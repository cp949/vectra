import { readInfiniteLineDirection, readInfiniteLineOrigin } from '../internal/infinite-line';
import { infiniteLineToLineFamilyParam, lineFamilyTriangleIntersectionPoint } from '../internal/line-family';
import { DEFAULT_EPSILON } from '../internal/numeric';
import { readTriangleRawCoords } from '../internal/triangle';
import { readX, readY } from '../internal/xy';
import type { InfiniteLineLike, TriangleLike, XYObjectWritable } from '../types';

/**
 * infinite-line과 triangle의 단일 교점을 새 object로 반환한다.
 *
 * 교점이 2개 이상이거나 degenerate triangle이면 undefined를 반환한다.
 * allocating companion — internal helper를 직접 호출한다.
 */
export function singleIntersectionInfiniteLineTriangle(
  infiniteLine: InfiniteLineLike,
  triangle: TriangleLike,
  epsilon = DEFAULT_EPSILON
): XYObjectWritable | undefined {
  const origin = readInfiniteLineOrigin(infiniteLine);
  const dir = readInfiniteLineDirection(infiniteLine);
  const lineParam = infiniteLineToLineFamilyParam(readX(origin), readY(origin), readX(dir), readY(dir));
  const { ax, ay, bx, by, cx, cy } = readTriangleRawCoords(triangle);
  const out: XYObjectWritable = { x: 0, y: 0 };
  return lineFamilyTriangleIntersectionPoint(out, lineParam, ax, ay, bx, by, cx, cy, epsilon) ? out : undefined;
}
