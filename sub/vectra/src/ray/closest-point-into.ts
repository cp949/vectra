import { readRayDirection, readRayOrigin } from '../internal/ray';
import { readX, readY, writeXY } from '../internal/xy';
import type { RayLike, XYInput, XYWritable } from '../types';

/**
 * ray 위에서 `point`와 가장 가까운 점을 `out`에 기록하고 `out`을 반환한다.
 *
 * `t`를 `[0, Infinity)`로 clamp한다. backward point(t < 0)는 origin에 고정된다.
 * degenerate ray(`directionLengthSq === 0`)에서는 origin을 기록한다.
 */
export function closestPointInto<Out extends XYWritable>(out: Out, ray: RayLike, point: XYInput): Out {
  const ox = readX(readRayOrigin(ray));
  const oy = readY(readRayOrigin(ray));
  const dx = readX(readRayDirection(ray));
  const dy = readY(readRayDirection(ray));
  const lenSq = dx * dx + dy * dy;
  if (lenSq === 0) return writeXY(out, ox, oy);
  const px = readX(point) - ox;
  const py = readY(point) - oy;
  // t를 [0, Infinity)로 clamp — backward는 origin에 고정
  const t = Math.max(0, (px * dx + py * dy) / lenSq);
  return writeXY(out, ox + t * dx, oy + t * dy);
}
