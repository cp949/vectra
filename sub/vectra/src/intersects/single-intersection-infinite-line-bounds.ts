import { readBoundsMax, readBoundsMin } from '../internal/bounds';
import { readInfiniteLineDirection, readInfiniteLineOrigin } from '../internal/infinite-line';
import { infiniteLineToLineFamilyParam, lineFamilyBoxIntersectionPoint } from '../internal/line-family';
import { DEFAULT_EPSILON } from '../internal/numeric';
import { readX, readY } from '../internal/xy';
import type { BoundsLike, InfiniteLineLike, XYObjectWritable } from '../types';

/**
 * infinite-line과 bounds의 단일 교점을 새 object로 반환한다.
 *
 * 교점이 2개 이상이거나 collinear, inverted bounds (max < min)이면 undefined를 반환한다.
 * allocating companion — internal helper를 직접 호출한다.
 */
export function singleIntersectionInfiniteLineBounds(
  infiniteLine: InfiniteLineLike,
  bounds: BoundsLike,
  epsilon = DEFAULT_EPSILON
): XYObjectWritable | undefined {
  const min = readBoundsMin(bounds);
  const max = readBoundsMax(bounds);
  const x0 = readX(min);
  const y0 = readY(min);
  const x1 = readX(max);
  const y1 = readY(max);
  if (x1 < x0 || y1 < y0) return undefined;
  const origin = readInfiniteLineOrigin(infiniteLine);
  const dir = readInfiniteLineDirection(infiniteLine);
  const lineParam = infiniteLineToLineFamilyParam(readX(origin), readY(origin), readX(dir), readY(dir));
  const out: XYObjectWritable = { x: 0, y: 0 };
  return lineFamilyBoxIntersectionPoint(out, lineParam, x0, y0, x1, y1, epsilon) ? out : undefined;
}
