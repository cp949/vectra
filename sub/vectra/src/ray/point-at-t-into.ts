import { readRayDirection, readRayOrigin } from '../internal/ray';
import { readX, readY, writeXY } from '../internal/xy';
import type { RayLike, XYWritable } from '../types';

/**
 * `origin + direction * t` 위치를 `out`에 기록하고 `out`을 반환한다.
 *
 * `t`는 clamp하지 않는다. `t < 0`이면 backward supporting line 위치를 기록한다.
 * degenerate ray(direction length ≒ 0)에서는 `t`에 무관하게 origin을 기록한다.
 */
export function pointAtTInto<Out extends XYWritable>(out: Out, ray: RayLike, t: number): Out {
  const ox = readX(readRayOrigin(ray));
  const oy = readY(readRayOrigin(ray));
  const dx = readX(readRayDirection(ray));
  const dy = readY(readRayDirection(ray));
  const lenSq = dx * dx + dy * dy;
  if (lenSq === 0) return writeXY(out, ox, oy);
  return writeXY(out, ox + t * dx, oy + t * dy);
}
