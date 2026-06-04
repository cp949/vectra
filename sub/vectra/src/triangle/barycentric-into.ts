import { readTriangleRawCoords, triangleSignedArea2x } from '../internal/triangle';
import { readX, readY } from '../internal/xy';
import type { BarycentricWritable, TriangleLike, XYInput } from '../types';

export type { BarycentricWritable };

/**
 * point의 barycentric 좌표를 계산해 out에 기록하고 out을 반환한다.
 *
 * out.x = u (vertex A 가중치), out.y = v (vertex B 가중치), out.w = w (vertex C 가중치).
 * u + v + w === 1. 내부 point이면 u, v, w 모두 양수다.
 * degenerate triangle(signedArea2x === 0)이면 out을 수정하지 않고 false를 반환한다.
 *
 * @param out barycentric 좌표를 기록할 writable output
 * @param triangle 기준 triangle
 * @param point barycentric 좌표를 구할 point
 * @returns out 또는 false(degenerate)
 */
export function barycentricInto<Out extends BarycentricWritable>(
  out: Out,
  triangle: TriangleLike,
  point: XYInput
): Out | false {
  const den = triangleSignedArea2x(triangle);
  if (den === 0) return false;
  const { ax, ay, bx, by, cx, cy } = readTriangleRawCoords(triangle);
  const px = readX(point);
  const py = readY(point);
  const v = ((cy - ay) * (px - ax) + (ax - cx) * (py - ay)) / den;
  const w = ((ay - by) * (px - ax) + (bx - ax) * (py - ay)) / den;
  const u = 1 - v - w;
  out.x = u;
  out.y = v;
  out.w = w;
  return out;
}
