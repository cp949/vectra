import { readCircleCenter, readCircleRadius } from '../internal/circle';
import { readX, readY, writeXY } from '../internal/xy';
import type { CircleLike, CircleWritable, XYWritable } from '../types';

/**
 * circle의 center와 radius를 scalar로 곱한 결과를 out에 기록하고 out을 반환한다.
 *
 * radius에 Math.abs를 적용하지 않는다. 음수 scalar로 음수 radius가 되는 경우는 caller 책임이다.
 * input과 out이 같은 object여도 안전하다.
 *
 * @param out scale 결과를 기록할 writable output
 * @param circle scale할 circle
 * @param scalar center 좌표와 radius에 곱할 값
 */
export function scaleInto<Out extends CircleWritable<XYWritable>>(out: Out, circle: CircleLike, scalar: number): Out {
  // aliasing 안전 - 입력을 먼저 읽은 후 기록한다
  const cx = readX(readCircleCenter(circle));
  const cy = readY(readCircleCenter(circle));
  const r = readCircleRadius(circle);
  writeXY(out.center, cx * scalar, cy * scalar);
  out.radius = r * scalar;
  return out;
}
