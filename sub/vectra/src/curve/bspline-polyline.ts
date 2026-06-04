import type { BSplinePolylineOptions, XYInput, XYObjectWritable } from '../types';
import { bsplinePolylineInto } from './bspline-polyline-into';

/**
 * Uniform cubic B-Spline 곡선을 steps개 점으로 샘플링한 새 XYObjectWritable[] 배열을 반환한다.
 *
 * t = 0, 1/steps, 2/steps, ..., (steps-1)/steps 위치를 샘플링한다. t=1은 포함하지 않는다.
 * open curve에서 n < 4이면 빈 배열 반환. closed curve에서 n < 1이면 빈 배열 반환.
 * steps <= 0이면 빈 배열 반환.
 * 성능 최적화가 필요하면 `bsplinePolylineInto`를 사용한다.
 *
 * @param points control point 배열
 * @param stepsOrOptions 샘플 수 또는 옵션 객체
 * @returns 새로 만든 XYObjectWritable point 배열
 */
export function bsplinePolyline(
  points: readonly XYInput[],
  stepsOrOptions?: number | BSplinePolylineOptions
): XYObjectWritable[] {
  const out: XYObjectWritable[] = [];
  bsplinePolylineInto(out, points, stepsOrOptions);
  return out;
}
