import { readRayDirection, readRayOrigin } from '../internal/ray';
import { readX, readY } from '../internal/xy';
import type { RayLike, XYInput } from '../types';

/**
 * ray와 `point` 사이 최단 거리를 반환한다.
 *
 * `t`를 `[0, Infinity)`로 clamp해 최근접점을 구한다.
 * degenerate ray(`directionLengthSq === 0`)에서는 origin-point 거리를 반환한다.
 */
export function distanceToPoint(ray: RayLike, point: XYInput): number {
  const ox = readX(readRayOrigin(ray));
  const oy = readY(readRayOrigin(ray));
  const dx = readX(readRayDirection(ray));
  const dy = readY(readRayDirection(ray));
  const lenSq = dx * dx + dy * dy;
  const px = readX(point) - ox;
  const py = readY(point) - oy;
  if (lenSq === 0) return Math.hypot(px, py);
  // t를 [0, Infinity)로 clamp
  const t = Math.max(0, (px * dx + py * dy) / lenSq);
  const cx = ox + t * dx - readX(point);
  const cy = oy + t * dy - readY(point);
  return Math.hypot(cx, cy);
}
