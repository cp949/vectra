import { readRayDirection, readRayOrigin } from '../internal/ray';
import { readX, readY, writeXY } from '../internal/xy';
import type { RayLike, RayWritable, XYWritable } from '../types';

/**
 * `RayLike` source의 component를 `out`에 복사하고 `out`을 반환한다.
 *
 * alias 호출에서도 안전하도록 모든 좌표를 먼저 읽은 뒤 기록한다.
 */
export function copyInto<Out extends RayWritable<XYWritable, XYWritable>>(out: Out, ray: RayLike): Out {
  const ox = readX(readRayOrigin(ray));
  const oy = readY(readRayOrigin(ray));
  const dx = readX(readRayDirection(ray));
  const dy = readY(readRayDirection(ray));
  writeXY(out.origin, ox, oy);
  writeXY(out.direction, dx, dy);
  return out;
}
