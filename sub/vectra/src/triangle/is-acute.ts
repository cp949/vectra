import { readTriangleRawCoords } from '../internal/triangle';
import type { TriangleLike } from '../types';

/**
 * triangle의 세 내각이 모두 π/2보다 작으면 true를 반환한다.
 *
 * 각 vertex의 dot product가 모두 양수이면 예각삼각형이다.
 * degenerate triangle은 별도로 검사하지 않는다.
 *
 * @param triangle 검사할 triangle
 */
export function isAcute(triangle: TriangleLike): boolean {
  const { ax, ay, bx, by, cx, cy } = readTriangleRawCoords(triangle);
  // dot at A > 0
  if (!((bx - ax) * (cx - ax) + (by - ay) * (cy - ay) > 0)) return false;
  // dot at B > 0
  if (!((ax - bx) * (cx - bx) + (ay - by) * (cy - by) > 0)) return false;
  // dot at C > 0
  if (!((ax - cx) * (bx - cx) + (ay - cy) * (by - cy) > 0)) return false;
  return true;
}
