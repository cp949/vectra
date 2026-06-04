import { readRayDirection, readRayOrigin } from '../internal/ray';
import { readX, readY, writeXY } from '../internal/xy';
import type { RayLike, RayWritable, XYWritable } from '../types';

/**
 * 같은 방향을 반대 방향으로 순회하도록 `direction`만 부호 반전해 `out`에 기록하고 `out`을 반환한다.
 *
 * `origin`은 유지한다. `out`과 `ray`가 같은 object여도 alias-safe하다.
 */
export function reverseInto<Out extends RayWritable<XYWritable, XYWritable>>(out: Out, ray: RayLike): Out {
  // alias 호출에서도 안전하도록 모든 좌표를 먼저 읽는다
  const ox = readX(readRayOrigin(ray));
  const oy = readY(readRayOrigin(ray));
  const dx = readX(readRayDirection(ray));
  const dy = readY(readRayDirection(ray));
  writeXY(out.origin, ox, oy);
  writeXY(out.direction, -dx, -dy);
  return out;
}
