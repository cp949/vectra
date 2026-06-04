import { readCircleCenter, readCircleRadius } from '../internal/circle';
import { readX, readY, writeXY } from '../internal/xy';
import type { CircleLike, CircleWritable, XYWritable } from '../types';

/**
 * circle의 radius에 amount를 더한 결과를 out에 기록하고 out을 반환한다.
 *
 * center는 그대로 복사된다. amount가 음수이면 radius가 줄어든다. 결과 radius에 clamp를 적용하지
 * 않는다. input과 out이 같은 object여도 안전하다.
 *
 * @param out 결과를 기록할 writable output
 * @param circle 기준 circle
 * @param amount radius에 더할 값 (음수 허용)
 */
export function expandByInto<Out extends CircleWritable<XYWritable>>(
  out: Out,
  circle: CircleLike,
  amount: number
): Out {
  // aliasing 안전 - 입력을 먼저 읽은 후 기록한다
  const cx = readX(readCircleCenter(circle));
  const cy = readY(readCircleCenter(circle));
  const r = readCircleRadius(circle);
  writeXY(out.center, cx, cy);
  out.radius = r + amount;
  return out;
}
