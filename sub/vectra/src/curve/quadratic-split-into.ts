import { readX, readY, writeXY } from '../internal/xy';
import type { QuadraticCurveWritable, XYInput, XYWritable } from '../types';

/**
 * quadratic Bezier curve를 파라미터 t 위치에서 de Casteljau 알고리즘으로 분할하여
 * outLeft와 outRight에 각각 기록하고 outLeft를 반환한다.
 *
 * ```
 * lerpP01  = lerp(p0, p1, t)
 * lerpP12  = lerp(p1, p2, t)
 * pointAt  = lerp(lerpP01, lerpP12, t)
 * outLeft  = { p0, p1: lerpP01, p2: pointAt }
 * outRight = { p0: pointAt, p1: lerpP12, p2 }
 * ```
 *
 * t는 clamp 없이 수식 그대로 계산한다.
 * outLeft.p2와 outRight.p0은 같은 point 값을 가진다(연속성 보장).
 *
 * @param outLeft 분할 후 좌측 sub-curve를 기록할 writable output
 * @param outRight 분할 후 우측 sub-curve를 기록할 writable output
 * @param p0 curve 시작점
 * @param p1 curve 제어점
 * @param p2 curve 끝점
 * @param t 분할 파라미터 (일반적으로 [0, 1], clamp 없음)
 */
export function quadraticSplitInto<L extends QuadraticCurveWritable, R extends QuadraticCurveWritable>(
  outLeft: L,
  outRight: R,
  p0: XYInput,
  p1: XYInput,
  p2: XYInput,
  t: number
): L {
  const p0x = readX(p0);
  const p0y = readY(p0);
  const p1x = readX(p1);
  const p1y = readY(p1);
  const p2x = readX(p2);
  const p2y = readY(p2);

  // de Casteljau 1단계
  const lerpP01x = p0x + t * (p1x - p0x);
  const lerpP01y = p0y + t * (p1y - p0y);
  const lerpP12x = p1x + t * (p2x - p1x);
  const lerpP12y = p1y + t * (p2y - p1y);

  // de Casteljau 2단계: split point
  const pointAtX = lerpP01x + t * (lerpP12x - lerpP01x);
  const pointAtY = lerpP01y + t * (lerpP12y - lerpP01y);

  // outLeft: { p0, p1: lerpP01, p2: pointAt }
  writeXY(outLeft.p0 as XYWritable, p0x, p0y);
  writeXY(outLeft.p1 as XYWritable, lerpP01x, lerpP01y);
  writeXY(outLeft.p2 as XYWritable, pointAtX, pointAtY);

  // outRight: { p0: pointAt, p1: lerpP12, p2 }
  writeXY(outRight.p0 as XYWritable, pointAtX, pointAtY);
  writeXY(outRight.p1 as XYWritable, lerpP12x, lerpP12y);
  writeXY(outRight.p2 as XYWritable, p2x, p2y);

  return outLeft;
}
