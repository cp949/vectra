import type { Point } from '../types/flat-shapes.internal';

/**
 * 세 점 a, b, c의 방향을 부호 있는 면적으로 반환한다.
 *
 * 양수: CCW(반시계 방향), 0: collinear(일직선), 음수: CW(시계 방향).
 *
 * `cross3(a, b, c)`와 동일한 계산이다. 별도 alias가 아닌 독립 leaf이다.
 *
 * @param a 기준점
 * @param b 두 번째 점
 * @param c 세 번째 점
 */
export function orientation(a: Point, b: Point, c: Point): number {
  const ax = a.x;
  const ay = a.y;
  const bx = b.x;
  const by = b.y;
  const cx = c.x;
  const cy = c.y;

  return (bx - ax) * (cy - ay) - (by - ay) * (cx - ax);
}
