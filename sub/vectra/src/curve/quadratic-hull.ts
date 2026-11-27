import type { QuadraticCurve, PointWritable } from '../types/flat-shapes.internal';
import { quadraticHullInto } from './quadratic-hull-into';

/**
 * quadratic Bezier curve의 파라미터 t 위치 de Casteljau hull point 배열을 새 PointWritable[] 배열로 반환한다.
 *
 * 반환 순서:
 * ```
 * [0] p0
 * [1] p1
 * [2] p2
 * [3] lerpP01 = lerp(p0, p1, t)
 * [4] lerpP12 = lerp(p1, p2, t)
 * [5] pointAt = lerp(lerpP01, lerpP12, t)
 * ```
 * 총 6개의 object를 반환한다.
 * t는 clamp 없이 수식 그대로 계산한다.
 * 성능 최적화가 필요하면 `quadraticHullInto`를 사용한다.
 *
 * @param curve 시작점·제어점·끝점 좌표를 담은 곡선 객체
 * @param t 파라미터 (일반적으로 [0, 1], clamp 없음)
 * @returns 새로 만든 hull point 배열 (length 6)
 */
export function quadraticHull(curve: QuadraticCurve, t: number): PointWritable[] {
  return quadraticHullInto([], curve, t);
}
