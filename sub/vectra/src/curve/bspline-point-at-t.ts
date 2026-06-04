import type { BSplineOptions, XYInput } from '../types';
import { bsplinePointAtTInto } from './bspline-point-at-t-into';

/**
 * uniform cubic B-Spline 곡선 위의 t 위치 점을 새 object로 반환한다.
 *
 *
 * degenerate/empty 입력 처리 정책은 `bsplinePointAtTInto`와 동일하다.
 * clamp/정규화/fallback 정책은 `bsplinePointAtTInto`와 동일하다.
 * @param points control point 배열
 * @param t 0~1 곡선 파라미터
 * @param options closed 옵션
 * @returns {x, y} 좌표
 */
export function bsplinePointAtT(
  points: readonly XYInput[],
  t: number,
  options?: BSplineOptions
): { x: number; y: number } {
  return bsplinePointAtTInto({ x: 0, y: 0 }, points, t, options);
}
