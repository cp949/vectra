import type { CatmullRomPolylineOptions, XYInput, XYObjectWritable } from '../types';
import { catmullRomPolylineInto } from './catmull-rom-polyline-into';

/**
 * Catmull-Rom 곡선을 steps개 점으로 샘플링한 새 XYObjectWritable[] 배열을 반환한다.
 *
 * t = 0, 1/steps, 2/steps, ..., (steps-1)/steps 위치를 샘플링한다. t=1은 포함하지 않는다.
 * points.length < 2이면 빈 배열 반환. steps <= 0이면 빈 배열 반환.
 * 성능 최적화가 필요하면 `catmullRomPolylineInto`를 사용한다.
 *
 * @param points control point 배열
 * @param stepsOrOptions 샘플 수 또는 옵션 객체
 * @returns 새로 만든 XYObjectWritable point 배열
 */
export function catmullRomPolyline(
  points: readonly XYInput[],
  stepsOrOptions?: number | CatmullRomPolylineOptions
): XYObjectWritable[] {
  const out: XYObjectWritable[] = [];
  catmullRomPolylineInto(out, points, stepsOrOptions);
  return out;
}
