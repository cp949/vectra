import type { CubicCurveWritable, CubicCurve } from '../types/flat-shapes.internal';

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
 * @param curve 시작점·제어점·끝점 좌표를 담은 곡선 객체
 * @param t 분할 파라미터 (일반적으로 [0, 1], clamp 없음)
 * @returns outLeft
 */
export function cubicSplitInto<L extends CubicCurveWritable, R extends CubicCurveWritable>(
  outLeft: L,
  outRight: R,
  curve: CubicCurve,
  t: number
): L {
  const p0x = curve.x0;
  const p0y = curve.y0;
  const p1x = curve.x1;
  const p1y = curve.y1;
  const p2x = curve.x2;
  const p2y = curve.y2;
  const p3x = curve.x3;
  const p3y = curve.y3;

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
  outLeft.x0 = p0x;
  outLeft.y0 = p0y;
  outLeft.x1 = lerpP01x;
  outLeft.y1 = lerpP01y;
  outLeft.x2 = lerpP012x;
  outLeft.y2 = lerpP012y;
  outLeft.x3 = pointAtX;
  outLeft.y3 = pointAtY;

  // outRight: { p0: pointAt, p1: lerpP123, p2: lerpP23, p3 }
  outRight.x0 = pointAtX;
  outRight.y0 = pointAtY;
  outRight.x1 = lerpP123x;
  outRight.y1 = lerpP123y;
  outRight.x2 = lerpP23x;
  outRight.y2 = lerpP23y;
  outRight.x3 = p3x;
  outRight.y3 = p3y;

  return outLeft;
}
