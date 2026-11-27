import type { Point } from '../types/flat-shapes.internal';

/**
 * 두 점 a에서 b 방향의 각도(radian)를 반환한다.
 *
 * `Math.atan2(b.y - a.y, b.x - a.x)`. range: (-π, π].
 * zero-length vector(a === b)이면 0을 반환한다.
 *
 * @param a 시작 점
 * @param b 끝 점
 */
export function headingSegment(a: Point, b: Point): number {
  const dx = b.x - a.x;
  const dy = b.y - a.y;

  if (dx === 0 && dy === 0) return 0;

  return Math.atan2(dy, dx);
}
