import { readTriangleRawCoords } from '../internal/triangle';
import type { TriangleLike } from '../types';

/**
 * triangle의 세 변 길이 차이가 모두 epsilon 이하이면 true를 반환한다.
 *
 * epsilon 기본값은 0(정확한 같음)이다. epsilon은 절대 변 길이 차이이므로 좌표 규모에 맞게 조정한다.
 * degenerate triangle은 별도로 검사하지 않는다.
 *
 * @param triangle 검사할 triangle
 * @param epsilon 변 길이 절대 허용 오차 (기본값 0)
 */
export function isEquilateral(triangle: TriangleLike, epsilon = 0): boolean {
  const { ax, ay, bx, by, cx, cy } = readTriangleRawCoords(triangle);
  const ab = Math.hypot(bx - ax, by - ay);
  const bc = Math.hypot(cx - bx, cy - by);
  const ca = Math.hypot(ax - cx, ay - cy);

  return Math.abs(ab - bc) <= epsilon && Math.abs(bc - ca) <= epsilon && Math.abs(ca - ab) <= epsilon;
}
