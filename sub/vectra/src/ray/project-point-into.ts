import { readRayDirection, readRayOrigin } from '../internal/ray';
import { readX, readY, writeXY } from '../internal/xy';
import type { RayLike, XYInput, XYWritable } from '../types';

/**
 * `point`에서 ray supporting infinite-line으로 내린 수선의 발을 `out`에 기록하고 `out`을 반환한다.
 *
 * unclamped — ray forward/backward 구분 없이 supporting infinite-line 기준으로 계산한다.
 * degenerate ray(`directionLengthSq === 0`)에서는 origin을 기록한다.
 */
export function projectPointInto<Out extends XYWritable>(out: Out, ray: RayLike, point: XYInput): Out {
  const ox = readX(readRayOrigin(ray));
  const oy = readY(readRayOrigin(ray));
  const dx = readX(readRayDirection(ray));
  const dy = readY(readRayDirection(ray));
  const lenSq = dx * dx + dy * dy;
  if (lenSq === 0) return writeXY(out, ox, oy);
  const px = readX(point) - ox;
  const py = readY(point) - oy;
  const t = (px * dx + py * dy) / lenSq;
  return writeXY(out, ox + t * dx, oy + t * dy);
}
