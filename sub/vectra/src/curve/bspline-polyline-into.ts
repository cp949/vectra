import type { BSplinePolylineOptions } from '../types';
import type { Point, PointWritable } from '../types/flat-shapes.internal';
import { bsplinePointAtTInto } from './bspline-point-at-t-into';

/**
 * Uniform cubic B-Spline 곡선을 steps개 점으로 샘플링해 out에 기록한다.
 *
 * t = 0, 1/steps, 2/steps, ..., (steps-1)/steps 위치를 샘플링한다.
 * t=1은 포함하지 않는다.
 *
 * degenerate 처리:
 * - open curve에서 n < 4 (spanCount ≤ 0): out.length = 0 반환
 * - closed curve에서 n < 1: out.length = 0 반환
 * - steps ≤ 0: out.length = 0 반환
 *
 * @param out 결과를 기록할 점 배열 (호출 전 내용은 덮어쓴다). 루프마다 새 객체를 push하므로 out 요소와 points는 같은 객체가 되지 않는다.
 * @param points control point 배열
 * @param options 샘플링 옵션. 생략하면 32점을 기록한다.
 * @returns 기록이 완료된 out (입력과 동일한 참조)
 */
export function bsplinePolylineInto(
  out: PointWritable[],
  points: readonly Point[],
  options?: Required<BSplinePolylineOptions>
): PointWritable[] {
  const steps = options === undefined ? 32 : options.steps;
  const closed = options === undefined ? false : options.closed;

  if (steps <= 0) {
    out.length = 0;
    return out;
  }

  const n = points.length;
  const spanCount = closed ? n : n - 3;
  if (spanCount <= 0) {
    out.length = 0;
    return out;
  }

  out.length = 0;
  for (let i = 0; i < steps; i++) {
    const t = i / steps;
    const pt = { x: 0, y: 0 };
    bsplinePointAtTInto(pt, points, t, { closed });
    out.push(pt);
  }
  return out;
}
