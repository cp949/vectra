import { readRayDirection, readRayOrigin } from '../internal/ray';
import { readX, readY } from '../internal/xy';
import type { RayLike, XYInput } from '../types';

/**
 * `point`의 ray supporting infinite-line 위 parametric 위치 `t`를 unclamped로 반환한다.
 *
 * ray forward/backward 구분 없이 supporting infinite-line 기준으로 계산한다.
 * degenerate ray(`directionLengthSq === 0`)에서는 `0`을 반환한다.
 * division-by-zero guard 외에는 epsilon 비교를 하지 않는다.
 */
export function projectionT(ray: RayLike, point: XYInput): number {
  const ox = readX(readRayOrigin(ray));
  const oy = readY(readRayOrigin(ray));
  const dx = readX(readRayDirection(ray));
  const dy = readY(readRayDirection(ray));
  const lenSq = dx * dx + dy * dy;
  if (lenSq === 0) return 0;
  const px = readX(point) - ox;
  const py = readY(point) - oy;
  return (px * dx + py * dy) / lenSq;
}
