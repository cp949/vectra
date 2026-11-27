import type { QuadraticCurve, PointWritable } from '../types/flat-shapes.internal';

/**
 * quadratic Bezier curve의 파라미터 t 위치 de Casteljau hull point 배열을 out에 기록하고 out을 반환한다.
 *
 * out을 clear(length=0)한 뒤 다음 순서로 새 object를 push한다.
 * ```
 * [0] p0
 * [1] p1
 * [2] p2
 * [3] lerpP01 = lerp(p0, p1, t)
 * [4] lerpP12 = lerp(p1, p2, t)
 * [5] pointAt = lerp(lerpP01, lerpP12, t)
 * ```
 * 총 6개의 object를 push한다.
 * t는 clamp 없이 수식 그대로 계산한다.
 *
 * @param out hull point 배열을 기록할 PointWritable 배열 output. 기존 내용은 덮어쓴다.
 * @param curve 시작점·제어점·끝점 좌표를 담은 곡선 객체
 * @param t 파라미터 (일반적으로 [0, 1], clamp 없음)
 */
export function quadraticHullInto(out: PointWritable[], curve: QuadraticCurve, t: number): PointWritable[] {
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

  // de Casteljau 2단계: pointAt
  const pointAtX = lerpP01x + t * (lerpP12x - lerpP01x);
  const pointAtY = lerpP01y + t * (lerpP12y - lerpP01y);

  // 기존 내용 clear
  out.length = 0;

  // 순서대로 push: [curve, lerpP01, lerpP12, pointAt]
  out.push({ x: p0x, y: p0y });
  out.push({ x: p1x, y: p1y });
  out.push({ x: p2x, y: p2y });
  out.push({ x: lerpP01x, y: lerpP01y });
  out.push({ x: lerpP12x, y: lerpP12y });
  out.push({ x: pointAtX, y: pointAtY });

  return out;
}
