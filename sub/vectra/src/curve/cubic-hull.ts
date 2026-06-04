import type { XYInput, XYObjectWritable } from '../types';
import { cubicHullInto } from './cubic-hull-into';

/**
 * cubic Bezier curve의 파라미터 t 위치 de Casteljau hull point 배열을 새 XYObjectWritable[] 배열로 반환한다.
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
 * @param p0 curve 시작점
 * @param p1 첫 번째 제어점
 * @param p2 두 번째 제어점
 * @param p3 curve 끝점
 * @param t 파라미터 (일반적으로 [0, 1], clamp 없음)
 * @returns 새로 만든 hull point 배열 (length 10)
 */
export function cubicHull(p0: XYInput, p1: XYInput, p2: XYInput, p3: XYInput, t: number): XYObjectWritable[] {
  return cubicHullInto([], p0, p1, p2, p3, t);
}
