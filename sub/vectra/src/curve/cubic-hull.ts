import type { CubicCurve, PointWritable } from '../types/flat-shapes.internal';
import { cubicHullInto } from './cubic-hull-into';

/**
 * cubic Bezier curve의 파라미터 t 위치 de Casteljau hull point 배열을 새 점 배열로 반환한다.
 *
 * 반환 순서:
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
 * 총 10개의 object를 반환한다.
 * t는 clamp 없이 수식 그대로 계산한다.
 * 성능 최적화가 필요하면 `cubicHullInto`를 사용한다.
 *
 * @param curve 시작점·제어점·끝점 좌표를 담은 곡선 객체
 * @param t 파라미터 (일반적으로 [0, 1], clamp 없음)
 * @returns 새로 만든 hull point 배열 (length 10)
 */
export function cubicHull(curve: CubicCurve, t: number): PointWritable[] {
  return cubicHullInto([], curve, t);
}
