import { flatTriangleSignedArea2x } from '../internal/triangle';
import type { Triangle, Point } from '../types/flat-shapes.internal';
import type { BarycentricWritable } from '../types';

export type { BarycentricWritable };

/**
 * point의 barycentric 좌표를 계산해 out에 기록하고 out을 반환한다.
 *
 * out.x = u (vertex A 가중치), out.y = v (vertex B 가중치), out.w = w (vertex C 가중치).
 * u + v + w === 1. 내부 point이면 u, v, w 모두 양수다.
 * degenerate triangle(signedArea2x === 0)이면 out을 수정하지 않고 false를 반환한다.
 *
 * @param out barycentric 좌표를 기록할 barycentric 객체
 * @param triangle 기준 triangle
 * @param point barycentric 좌표를 구할 point
 * @returns out 또는 false(degenerate)
 */
export function barycentricInto<Out extends BarycentricWritable>(
  out: Out,
  triangle: Triangle,
  point: Point
): Out | false {
  const den = flatTriangleSignedArea2x(triangle);
  if (den === 0) return false;
  const { x1: ax, y1: ay, x2: bx, y2: by, x3: cx, y3: cy } = triangle;
  const px = point.x;
  const py = point.y;
  const v = ((cy - ay) * (px - ax) + (ax - cx) * (py - ay)) / den;
  const w = ((ay - by) * (px - ax) + (bx - ax) * (py - ay)) / den;
  const u = 1 - v - w;
  out.x = u;
  out.y = v;
  out.w = w;
  return out;
}
