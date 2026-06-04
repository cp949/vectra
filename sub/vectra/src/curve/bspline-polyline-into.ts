import type { BSplinePolylineOptions, XYInput, XYWritable } from '../types';
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
 * @param out 결과를 기록할 writable output 배열 (호출 전 내용은 덮어쓴다). 루프마다 신규 object를 push하므로 out 요소와 points 간 aliasing 없음
 * @param points control point 배열
 * @param stepsOrOptions 샘플 수 또는 옵션 객체
 */
export function bsplinePolylineInto(
  out: XYWritable[],
  points: readonly XYInput[],
  stepsOrOptions?: number | BSplinePolylineOptions
): void {
  let steps = 32;
  let closed = false;

  if (typeof stepsOrOptions === 'number') {
    steps = stepsOrOptions;
  } else if (stepsOrOptions != null) {
    if (stepsOrOptions.steps != null) steps = stepsOrOptions.steps;
    if (stepsOrOptions.closed != null) closed = stepsOrOptions.closed;
  }

  if (steps <= 0) {
    out.length = 0;
    return;
  }

  const n = points.length;
  const spanCount = closed ? n : n - 3;
  if (spanCount <= 0) {
    out.length = 0;
    return;
  }

  out.length = 0;
  for (let i = 0; i < steps; i++) {
    const t = i / steps;
    const pt = { x: 0, y: 0 };
    bsplinePointAtTInto(pt, points, t, { closed });
    out.push(pt);
  }
}
