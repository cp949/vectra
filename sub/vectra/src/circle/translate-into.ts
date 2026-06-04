import { readCircleCenter, readCircleRadius } from '../internal/circle';
import { readX, readY, writeXY } from '../internal/xy';
import type { CircleLike, CircleWritable, XYInput, XYWritable } from '../types';

/**
 * circle의 center를 offset만큼 평행 이동한 결과를 out에 기록하고 out을 반환한다.
 *
 * radius는 그대로 복사한다. input과 out이 같은 object여도 안전하다.
 *
 * @param out 이동된 circle을 기록할 writable output
 * @param circle 이동할 circle
 * @param offset center에 더할 이동 벡터
 */
export function translateInto<Out extends CircleWritable<XYWritable>>(
  out: Out,
  circle: CircleLike,
  offset: XYInput
): Out {
  // aliasing 안전 - 입력을 먼저 읽은 후 기록한다
  const cx = readX(readCircleCenter(circle));
  const cy = readY(readCircleCenter(circle));
  const r = readCircleRadius(circle);
  const ox = readX(offset);
  const oy = readY(offset);
  writeXY(out.center, cx + ox, cy + oy);
  out.radius = r;
  return out;
}
