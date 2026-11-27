import type { Point } from '../types/flat-shapes.internal';

/**
 * a에서 b로의 방향각을 radian으로 반환한다. 범위는 (-π, π]이다.
 *
 * CCW 방향이 양수이다.
 * a 또는 b가 zero vector이면 0을 반환한다.
 *
 * @param a 시작 방향 벡터
 * @param b 끝 방향 벡터
 */
export function directedAngle(a: Point, b: Point): number {
  const ax = a.x;
  const ay = a.y;
  const bx = b.x;
  const by = b.y;

  // zero vector는 방향이 없으므로 회전각 0으로 환원한다.
  if ((ax === 0 && ay === 0) || (bx === 0 && by === 0)) {
    return 0;
  }

  // cross(a, b) = ax*by - ay*bx, dot(a, b) = ax*bx + ay*by
  return Math.atan2(ax * by - ay * bx, ax * bx + ay * by);
}
