import { readX, readY, writeXY } from '../internal/xy';
import type { RayWritable, XYInput, XYWritable } from '../types';

/**
 * origin과 radian 각도를 받아 단위 방향 벡터를 가진 ray를 `out`에 기록하고 `out`을 반환한다.
 *
 * `dx = Math.cos(angle)`, `dy = Math.sin(angle)`으로 단위 direction을 계산한다.
 */
export function fromAngleInto<Out extends RayWritable<XYWritable, XYWritable>>(
  out: Out,
  origin: XYInput,
  angle: number
): Out {
  writeXY(out.origin, readX(origin), readY(origin));
  writeXY(out.direction, Math.cos(angle), Math.sin(angle));
  return out;
}
