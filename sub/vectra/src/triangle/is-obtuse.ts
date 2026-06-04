import { readTriangleRawCoords } from '../internal/triangle';
import type { TriangleLike } from '../types';

/**
 * triangle의 한 내각이 π/2보다 크면 true를 반환한다.
 *
 * 각 vertex의 dot product가 음수이면 해당 내각이 둔각이다.
 * collinear triangle에서는 한 vertex의 dot product가 음수가 되어 true를 반환한다.
 * degenerate triangle은 별도로 검사하지 않는다.
 *
 * @param triangle 검사할 triangle
 */
export function isObtuse(triangle: TriangleLike): boolean {
  const { ax, ay, bx, by, cx, cy } = readTriangleRawCoords(triangle);
  // dot at A
  if ((bx - ax) * (cx - ax) + (by - ay) * (cy - ay) < 0) return true;
  // dot at B
  if ((ax - bx) * (cx - bx) + (ay - by) * (cy - by) < 0) return true;
  // dot at C
  if ((ax - cx) * (bx - cx) + (ay - cy) * (by - cy) < 0) return true;
  return false;
}
