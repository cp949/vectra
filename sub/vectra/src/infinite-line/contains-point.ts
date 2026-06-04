import { readInfiniteLineDirection, readInfiniteLineOrigin } from '../internal/infinite-line';
import { DEFAULT_EPSILON } from '../internal/numeric';
import { readX, readY } from '../internal/xy';
import type { InfiniteLineLike, XYInput } from '../types';

/**
 * `point`가 infinite-line 위에 있으면 `true`를 반환한다.
 *
 * `distanceToPointSq(line, point) <= epsilon * epsilon`으로 판정한다.
 * degenerate infinite-line(`directionLengthSq === 0`)에서는 origin과 point의 일치 여부로 환원한다.
 *
 * @param line 검사할 infinite-line
 * @param point containment를 검사할 point
 * @param epsilon 허용 거리 (기본값 `1e-9`)
 */
export function containsPoint(line: InfiniteLineLike, point: XYInput, epsilon: number = DEFAULT_EPSILON): boolean {
  const ox = readX(readInfiniteLineOrigin(line));
  const oy = readY(readInfiniteLineOrigin(line));
  const dx = readX(readInfiniteLineDirection(line));
  const dy = readY(readInfiniteLineDirection(line));
  const lenSq = dx * dx + dy * dy;
  const px = readX(point) - ox;
  const py = readY(point) - oy;
  let distSq: number;
  if (lenSq === 0) {
    // degenerate: point containment으로 환원
    distSq = px * px + py * py;
  } else {
    const t = (px * dx + py * dy) / lenSq;
    const cx = t * dx - px;
    const cy = t * dy - py;
    distSq = cx * cx + cy * cy;
  }
  return distSq <= epsilon * epsilon;
}
