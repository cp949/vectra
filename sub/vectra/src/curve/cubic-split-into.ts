import { readX, readY, writeXY } from '../internal/xy';
import type { CubicCurveWritable, XYInput, XYWritable } from '../types';

/**
 * cubic Bezier curve를 파라미터 t 위치에서 de Casteljau 알고리즘으로 분할하여
 * outLeft와 outRight에 각각 기록하고 outLeft를 반환한다.
 *
 * ```
 * lerpP01  = lerp(p0, p1, t)
 * lerpP12  = lerp(p1, p2, t)
 * lerpP23  = lerp(p2, p3, t)
 * lerpP012 = lerp(lerpP01, lerpP12, t)
 * lerpP123 = lerp(lerpP12, lerpP23, t)
 * pointAt  = lerp(lerpP012, lerpP123, t)
 * outLeft  = { p0, p1: lerpP01, p2: lerpP012, p3: pointAt }
 * outRight = { p0: pointAt, p1: lerpP123, p2: lerpP23, p3 }
 * ```
 *
 * t는 clamp 없이 수식 그대로 계산한다.
 * outLeft.p3와 outRight.p0은 같은 point 값을 가진다(연속성 보장).
 *
 * @param outLeft 분할 후 좌측 sub-curve를 기록할 writable output
 * @param outRight 분할 후 우측 sub-curve를 기록할 writable output
 * @param p0 curve 시작점
 * @param p1 첫 번째 제어점
 * @param p2 두 번째 제어점
 * @param p3 curve 끝점
 * @param t 분할 파라미터 (일반적으로 [0, 1], clamp 없음)
 * @returns outLeft
 */
export function cubicSplitInto<L extends CubicCurveWritable, R extends CubicCurveWritable>(
  outLeft: L,
  outRight: R,
  p0: XYInput,
  p1: XYInput,
  p2: XYInput,
  p3: XYInput,
  t: number
): L {
  const p0x = readX(p0);
  const p0y = readY(p0);
  const p1x = readX(p1);
  const p1y = readY(p1);
  const p2x = readX(p2);
  const p2y = readY(p2);
  const p3x = readX(p3);
  const p3y = readY(p3);

  // de Casteljau 1단계
  const lerpP01x = p0x + t * (p1x - p0x);
  const lerpP01y = p0y + t * (p1y - p0y);
  const lerpP12x = p1x + t * (p2x - p1x);
  const lerpP12y = p1y + t * (p2y - p1y);
  const lerpP23x = p2x + t * (p3x - p2x);
  const lerpP23y = p2y + t * (p3y - p2y);

  // de Casteljau 2단계
  const lerpP012x = lerpP01x + t * (lerpP12x - lerpP01x);
  const lerpP012y = lerpP01y + t * (lerpP12y - lerpP01y);
  const lerpP123x = lerpP12x + t * (lerpP23x - lerpP12x);
  const lerpP123y = lerpP12y + t * (lerpP23y - lerpP12y);

  // de Casteljau 3단계: split point
  const pointAtX = lerpP012x + t * (lerpP123x - lerpP012x);
  const pointAtY = lerpP012y + t * (lerpP123y - lerpP012y);

  // outLeft: { p0, p1: lerpP01, p2: lerpP012, p3: pointAt }
  writeXY(outLeft.p0 as XYWritable, p0x, p0y);
  writeXY(outLeft.p1 as XYWritable, lerpP01x, lerpP01y);
  writeXY(outLeft.p2 as XYWritable, lerpP012x, lerpP012y);
  writeXY(outLeft.p3 as XYWritable, pointAtX, pointAtY);

  // outRight: { p0: pointAt, p1: lerpP123, p2: lerpP23, p3 }
  writeXY(outRight.p0 as XYWritable, pointAtX, pointAtY);
  writeXY(outRight.p1 as XYWritable, lerpP123x, lerpP123y);
  writeXY(outRight.p2 as XYWritable, lerpP23x, lerpP23y);
  writeXY(outRight.p3 as XYWritable, p3x, p3y);

  return outLeft;
}
