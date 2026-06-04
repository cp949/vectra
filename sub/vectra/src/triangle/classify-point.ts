import { readTriangleRawCoords } from '../internal/triangle';
import { readX, readY } from '../internal/xy';
import type { TriangleLike, XYInput } from '../types';

/**
 * point의 triangle에 대한 위치를 분류해 반환한다.
 *
 * barycentric 좌표를 사용해 판정한다.
 * - `'inside'`: triangle 내부
 * - `'on-edge'`: triangle 경계(edge 또는 vertex) 위
 * - `'outside'`: triangle 외부
 *
 * degenerate triangle(signed area === 0)이면 항상 `'outside'`를 반환한다.
 * epsilon 기본값은 0.
 *
 * @param triangle 대상 triangle
 * @param point 분류할 point
 * @param epsilon 경계 판정 tolerance. 기본값 0
 */
export function classifyPoint(triangle: TriangleLike, point: XYInput, epsilon = 0): 'inside' | 'on-edge' | 'outside' {
  const { ax, ay, bx, by, cx, cy } = readTriangleRawCoords(triangle);

  // degenerate triangle
  const den = (by - cy) * (ax - cx) + (cx - bx) * (ay - cy);
  if (den === 0) return 'outside';

  const px = readX(point);
  const py = readY(point);

  const u = ((by - cy) * (px - cx) + (cx - bx) * (py - cy)) / den;
  const v = ((cy - ay) * (px - cx) + (ax - cx) * (py - cy)) / den;
  const w = 1 - u - v;

  const lo = -epsilon;
  const hi = 1 + epsilon;

  if (u < lo || u > hi || v < lo || v > hi || w < lo || w > hi) {
    return 'outside';
  }

  // on-edge: 하나 이상의 barycentric 좌표가 0(또는 epsilon 범위)에 걸친다
  if (Math.abs(u) <= epsilon || Math.abs(v) <= epsilon || Math.abs(w) <= epsilon) {
    return 'on-edge';
  }

  return 'inside';
}
