import { readTriangleRawCoords } from '../internal/triangle';
import type { TriangleLike } from '../types';

function scaledRightThreshold(epsilon: number, dx1: number, dy1: number, dx2: number, dy2: number): number {
  return epsilon * Math.hypot(dx1, dy1) * Math.hypot(dx2, dy2);
}

/**
 * triangle의 한 내각이 직각이면 true를 반환한다.
 *
 * 각 vertex의 dot product로 직각 여부를 판정한다.
 * |dot| ≤ epsilon * |v1| * |v2|를 만족하면 해당 vertex가 직각이다.
 * epsilon은 cosine threshold 배율이다 (radian 단위가 아님). 기본값은 0(정확한 직각)이다.
 * epsilon ≥ 1이면 모든 triangle이 isRight = true가 된다.
 * degenerate triangle은 별도로 검사하지 않는다.
 *
 * @param triangle 검사할 triangle
 * @param epsilon dot product 허용 오차 (기본값 0)
 */
export function isRight(triangle: TriangleLike, epsilon = 0): boolean {
  const { ax, ay, bx, by, cx, cy } = readTriangleRawCoords(triangle);

  // At A: vectors AB, AC
  const abx = bx - ax;
  const aby = by - ay;
  const acx = cx - ax;
  const acy = cy - ay;
  const dotA = abx * acx + aby * acy;
  if (Math.abs(dotA) <= scaledRightThreshold(epsilon, abx, aby, acx, acy)) return true;

  // At B: vectors BA, BC
  const bax = ax - bx;
  const bay = ay - by;
  const bcx = cx - bx;
  const bcy = cy - by;
  const dotB = bax * bcx + bay * bcy;
  if (Math.abs(dotB) <= scaledRightThreshold(epsilon, bax, bay, bcx, bcy)) return true;

  // At C: vectors CA, CB
  const cax = ax - cx;
  const cay = ay - cy;
  const cbx = bx - cx;
  const cby = by - cy;
  const dotC = cax * cbx + cay * cby;
  if (Math.abs(dotC) <= scaledRightThreshold(epsilon, cax, cay, cbx, cby)) return true;

  return false;
}
