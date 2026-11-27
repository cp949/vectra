import type { Point } from '../types/flat-shapes.internal';

/**
 * 세 점 a, b, c의 2D cross product를 반환한다.
 *
 * `orientation(a, b, c)`와 동일한 계산이다. 삼각형 abc의 signed area는 반환값 / 2이다.
 * 양수: CCW, 0: collinear, 음수: CW.
 *
 * @param a 기준점
 * @param b 두 번째 점
 * @param c 세 번째 점
 */
export function cross3(a: Point, b: Point, c: Point): number {
  const ax = a.x;
  const ay = a.y;
  const bx = b.x;
  const by = b.y;
  const cx = c.x;
  const cy = c.y;

  return (bx - ax) * (cy - ay) - (by - ay) * (cx - ax);
}
