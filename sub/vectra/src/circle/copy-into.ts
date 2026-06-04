import { readCircleCenter, readCircleRadius } from '../internal/circle';
import { readX, readY, writeXY } from '../internal/xy';
import type { CircleLike, CircleWritable, XYInput, XYWritable } from '../types';

/**
 * circle의 center와 radius를 out에 복사하고 out을 반환한다.
 *
 * input과 out이 같은 object여도 안전하다.
 *
 * @param out circle 값을 기록할 writable output
 * @param circle 복사할 circle 또는 center 좌표
 * @param radius radius 값
 */
export function copyInto<Out extends CircleWritable<XYWritable>>(out: Out, circle: CircleLike): Out;
export function copyInto<Out extends CircleWritable<XYWritable>>(out: Out, center: XYInput, radius: number): Out;
export function copyInto<Out extends CircleWritable<XYWritable>>(
  out: Out,
  circleOrCenter: CircleLike | XYInput,
  radius?: number
): Out {
  // aliasing 안전 - 모든 입력을 먼저 읽은 후 기록한다
  const center = radius === undefined ? readCircleCenter(circleOrCenter as CircleLike) : (circleOrCenter as XYInput);
  const cx = readX(center);
  const cy = readY(center);
  const r = radius === undefined ? readCircleRadius(circleOrCenter as CircleLike) : radius;
  writeXY(out.center, cx, cy);
  out.radius = r;
  return out;
}
