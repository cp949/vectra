import type { BSplineOptions, PathCommand, XYInput } from '../types';
import { bsplinePathInto } from './bspline-path-into';

/**
 * uniform cubic B-Spline point list를 cubic Bezier PathCommand[]로 변환한 새 배열을 반환한다.
 *
 * open curve는 n ≥ 4, closed curve는 n ≥ 1이어야 span이 생긴다. 그 미만이면 빈 배열 반환.
 * 성능 최적화가 필요하면 `bsplinePathInto`를 사용한다.
 *
 * @param points B-Spline 제어점 배열
 * @param options closed 여부 등 옵션
 * @returns 새로 만든 PathCommand 배열
 */
export function bsplinePath(points: readonly XYInput[], options?: BSplineOptions): PathCommand[] {
  return bsplinePathInto([], points, options);
}
