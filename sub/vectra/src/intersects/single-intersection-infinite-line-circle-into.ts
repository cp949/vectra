import { readCircleCenter, readCircleRadius } from '../internal/circle';
import { readInfiniteLineDirection, readInfiniteLineOrigin } from '../internal/infinite-line';
import { infiniteLineToLineFamilyParam, lineFamilyCircleIntersectionPoint } from '../internal/line-family';
import { DEFAULT_EPSILON } from '../internal/numeric';
import { readX, readY } from '../internal/xy';
import type { CircleLike, InfiniteLineLike, XYWritable } from '../types';

/**
 * infinite-line과 circle의 단일 교점을 out에 기록하고 true를 반환한다.
 *
 * tangent이면 접점을 기록한다. 2-point crossing이면 false (out 미수정).
 * empty circle (radius ≤ 0): false.
 */
export function singleIntersectionInfiniteLineCircleInto(
  out: XYWritable,
  infiniteLine: InfiniteLineLike,
  circle: CircleLike,
  epsilon = DEFAULT_EPSILON
): boolean {
  const origin = readInfiniteLineOrigin(infiniteLine);
  const dir = readInfiniteLineDirection(infiniteLine);
  const lineParam = infiniteLineToLineFamilyParam(readX(origin), readY(origin), readX(dir), readY(dir));
  const center = readCircleCenter(circle);
  return lineFamilyCircleIntersectionPoint(
    out,
    lineParam,
    readX(center),
    readY(center),
    readCircleRadius(circle),
    epsilon
  );
}
