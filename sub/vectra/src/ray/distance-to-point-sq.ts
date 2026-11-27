import type { Ray, Point } from '../types/flat-shapes.internal';

/**
 * ray와 `point` 사이 최단 거리의 제곱을 반환한다.
 *
 * `t`를 `[0, Infinity)`로 clamp해 최근접점을 구한다.
 * degenerate ray(`directionLengthSq === 0`)에서는 origin-point 거리의 제곱을 반환한다.
 */
export function distanceToPointSq(ray: Ray, point: Point): number {
  const { ox, oy, dx, dy } = ray;
  const lenSq = dx * dx + dy * dy;
  const px = point.x - ox;
  const py = point.y - oy;
  if (lenSq === 0) return px * px + py * py;
  // t를 [0, Infinity)로 clamp
  const t = Math.max(0, (px * dx + py * dy) / lenSq);
  const cx = ox + t * dx - point.x;
  const cy = oy + t * dy - point.y;
  return cx * cx + cy * cy;
}
