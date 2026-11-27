import type { CubicCurve, PointWritable } from '../types/flat-shapes.internal';

/**
 * cubic Bezier curve의 파라미터 t 위치 de Casteljau hull point 배열을 out에 기록하고 out을 반환한다.
 *
 * out을 clear(length=0)한 뒤 다음 순서로 새 object를 push한다.
 * ```
 * [0] p0
 * [1] p1
 * [2] p2
 * [3] p3
 * [4] lerpP01  = lerp(p0, p1, t)
 * [5] lerpP12  = lerp(p1, p2, t)
 * [6] lerpP23  = lerp(p2, p3, t)
 * [7] lerpP012 = lerp(lerpP01, lerpP12, t)
 * [8] lerpP123 = lerp(lerpP12, lerpP23, t)
 * [9] pointAt  = lerp(lerpP012, lerpP123, t)
 * ```
 * 총 10개의 object를 push한다.
 * t는 clamp 없이 수식 그대로 계산한다.
 *
 * @param out hull 점을 기록할 점 배열. 기존 내용은 clear된다.
 * @param curve 시작점·제어점·끝점 좌표를 담은 곡선 객체
 * @param t 파라미터 (일반적으로 [0, 1], clamp 없음)
 * @returns out
 */
export function cubicHullInto(out: PointWritable[], curve: CubicCurve, t: number): PointWritable[] {
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

  // de Casteljau 3단계: pointAt
  const pointAtX = lerpP012x + t * (lerpP123x - lerpP012x);
  const pointAtY = lerpP012y + t * (lerpP123y - lerpP012y);

  // 기존 내용 clear
  out.length = 0;

  // 순서대로 push: [curve, lerpP01, lerpP12, lerpP23, lerpP012, lerpP123, pointAt]
  out.push({ x: p0x, y: p0y });
  out.push({ x: p1x, y: p1y });
  out.push({ x: p2x, y: p2y });
  out.push({ x: p3x, y: p3y });
  out.push({ x: lerpP01x, y: lerpP01y });
  out.push({ x: lerpP12x, y: lerpP12y });
  out.push({ x: lerpP23x, y: lerpP23y });
  out.push({ x: lerpP012x, y: lerpP012y });
  out.push({ x: lerpP123x, y: lerpP123y });
  out.push({ x: pointAtX, y: pointAtY });

  return out;
}
