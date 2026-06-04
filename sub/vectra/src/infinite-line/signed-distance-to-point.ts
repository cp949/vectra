import { readInfiniteLineDirection, readInfiniteLineOrigin } from '../internal/infinite-line';
import { readX, readY } from '../internal/xy';
import type { InfiniteLineLike, XYInput } from '../types';

/**
 * infinite-line과 `point` 사이의 부호 있는 거리를 반환한다.
 *
 * 공식: `cross(direction, point - origin) / |direction|`
 * = `(dx * (py - oy) - dy * (px - ox)) / hypot(dx, dy)`
 *
 * 좌측 양수 (y-up 수학 관례). y-down 화면 좌표계에서는 우측이 양수로 읽힌다.
 * degenerate infinite-line (`direction = (0,0)`)에서는 unsigned 거리를 반환한다.
 * NaN/Infinity 입력은 수식 결과를 그대로 pass-through한다.
 *
 * @param line 기준 infinite-line
 * @param point 거리를 측정할 point
 */
export function signedDistanceToPoint(line: InfiniteLineLike, point: XYInput): number {
  const ox = readX(readInfiniteLineOrigin(line));
  const oy = readY(readInfiniteLineOrigin(line));
  const dx = readX(readInfiniteLineDirection(line));
  const dy = readY(readInfiniteLineDirection(line));
  const px = readX(point) - ox;
  const py = readY(point) - oy;
  const len = Math.hypot(dx, dy);
  if (len === 0) return Math.hypot(px, py); // degenerate: unsigned 거리
  const cross = dx * py - dy * px; // cross product (direction × relative-point)
  return cross / len;
}
