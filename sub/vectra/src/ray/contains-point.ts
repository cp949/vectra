import { DEFAULT_EPSILON } from '../internal/numeric';
import { readRayDirection, readRayOrigin } from '../internal/ray';
import { readX, readY } from '../internal/xy';
import type { RayLike, XYInput } from '../types';

/**
 * `point`가 ray 위에 있으면 `true`를 반환한다.
 *
 * supporting infinite-line 위에 있고(`distanceSq <= epsilon * epsilon`) forward side(`t >= 0`)이면 `true`.
 * degenerate ray(`directionLengthSq === 0`)에서는 origin과 point의 일치 여부로 환원한다.
 *
 * @param ray 검사할 ray
 * @param point containment를 검사할 point
 * @param epsilon 허용 거리 (기본값 `1e-9`)
 */
export function containsPoint(ray: RayLike, point: XYInput, epsilon: number = DEFAULT_EPSILON): boolean {
  const ox = readX(readRayOrigin(ray));
  const oy = readY(readRayOrigin(ray));
  const dx = readX(readRayDirection(ray));
  const dy = readY(readRayDirection(ray));
  const lenSq = dx * dx + dy * dy;
  const px = readX(point) - ox;
  const py = readY(point) - oy;
  if (lenSq === 0) {
    // degenerate: point containment으로 환원
    return px * px + py * py <= epsilon * epsilon;
  }
  const t = (px * dx + py * dy) / lenSq;
  // backward side는 포함하지 않는다
  if (t < 0) return false;
  const cx = t * dx - px;
  const cy = t * dy - py;
  return cx * cx + cy * cy <= epsilon * epsilon;
}
