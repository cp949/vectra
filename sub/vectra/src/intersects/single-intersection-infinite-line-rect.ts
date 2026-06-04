import { readInfiniteLineDirection, readInfiniteLineOrigin } from '../internal/infinite-line';
import { infiniteLineToLineFamilyParam, lineFamilyBoxIntersectionPoint } from '../internal/line-family';
import { DEFAULT_EPSILON } from '../internal/numeric';
import { readRectHeight, readRectWidth, readRectX, readRectY } from '../internal/rect';
import { readX, readY } from '../internal/xy';
import type { InfiniteLineLike, RectLike, XYObjectWritable } from '../types';

/**
 * infinite-line과 rect의 단일 교점을 새 object로 반환한다.
 *
 * 교점이 2개 이상이거나 collinear, empty rect (w/h ≤ 0)이면 undefined를 반환한다.
 * allocating companion — internal helper를 직접 호출한다.
 */
export function singleIntersectionInfiniteLineRect(
  infiniteLine: InfiniteLineLike,
  rect: RectLike,
  epsilon = DEFAULT_EPSILON
): XYObjectWritable | undefined {
  const rw = readRectWidth(rect);
  const rh = readRectHeight(rect);
  if (rw <= 0 || rh <= 0) return undefined;
  const origin = readInfiniteLineOrigin(infiniteLine);
  const dir = readInfiniteLineDirection(infiniteLine);
  const lineParam = infiniteLineToLineFamilyParam(readX(origin), readY(origin), readX(dir), readY(dir));
  const rx = readRectX(rect);
  const ry = readRectY(rect);
  const out: XYObjectWritable = { x: 0, y: 0 };
  return lineFamilyBoxIntersectionPoint(out, lineParam, rx, ry, rx + rw, ry + rh, epsilon) ? out : undefined;
}
