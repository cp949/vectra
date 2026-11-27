import type { QuadraticCurveWritable, QuadraticCurve } from '../types/flat-shapes.internal';

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
 * @param outLeft 분할 후 왼쪽 부분 곡선을 기록할 이차 베지어 객체
 * @param outRight 분할 후 오른쪽 부분 곡선을 기록할 이차 베지어 객체
 * @param curve 시작점·제어점·끝점 좌표를 담은 곡선 객체
 * @param t 분할 파라미터 (일반적으로 [0, 1], clamp 없음)
 */
export function quadraticSplitInto<L extends QuadraticCurveWritable, R extends QuadraticCurveWritable>(
  outLeft: L,
  outRight: R,
  curve: QuadraticCurve,
  t: number
): L {
  const p0x = curve.x0;
  const p0y = curve.y0;
  const p1x = curve.x1;
  const p1y = curve.y1;
  const p2x = curve.x2;
  const p2y = curve.y2;

  // de Casteljau 1단계
  const lerpP01x = p0x + t * (p1x - p0x);
  const lerpP01y = p0y + t * (p1y - p0y);
  const lerpP12x = p1x + t * (p2x - p1x);
  const lerpP12y = p1y + t * (p2y - p1y);

  // de Casteljau 2단계: split point
  const pointAtX = lerpP01x + t * (lerpP12x - lerpP01x);
  const pointAtY = lerpP01y + t * (lerpP12y - lerpP01y);

  // outLeft: { p0, p1: lerpP01, p2: pointAt }
  outLeft.x0 = p0x;
  outLeft.y0 = p0y;
  outLeft.x1 = lerpP01x;
  outLeft.y1 = lerpP01y;
  outLeft.x2 = pointAtX;
  outLeft.y2 = pointAtY;

  // outRight: { p0: pointAt, p1: lerpP12, p2 }
  outRight.x0 = pointAtX;
  outRight.y0 = pointAtY;
  outRight.x1 = lerpP12x;
  outRight.y1 = lerpP12y;
  outRight.x2 = p2x;
  outRight.y2 = p2y;

  return outLeft;
}
