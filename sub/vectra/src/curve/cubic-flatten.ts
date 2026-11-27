import type { FlattenOptions } from '../types';
import type { CubicCurve, PointWritable } from '../types/flat-shapes.internal';
import { cubicFlattenInto } from './cubic-flatten-into';

/**
 * cubic Bezier curve를 adaptive subdivision으로 polyline에 근사한 새 PointWritable[] 배열을 반환한다.
 *
 * 직선(flat) curve는 시작점과 끝점 두 개만 담은 길이 2 배열을 반환한다.
 * 성능 최적화가 필요하면 `cubicFlattenInto`를 사용한다.
 *
 * @param curve 시작점·제어점·끝점 좌표를 담은 곡선 객체
 * @param options flatten 옵션 (flatness 기본값 0.5, maxRecursion 기본값 32)
 * @returns 새로 만든 PointWritable point 배열
 */
export function cubicFlatten(curve: CubicCurve, options?: Required<FlattenOptions>): PointWritable[] {
  return cubicFlattenInto([], curve, options);
}
