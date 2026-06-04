import type { CatmullRomPolylineOptions, XYInput, XYWritable } from '../types';
import { catmullRomPointAtTInto } from './catmull-rom-point-at-t-into';

/**
 * Catmull-Rom 곡선을 steps개 점으로 샘플링해 out에 기록한다.
 *
 * t = 0, 1/steps, 2/steps, ..., (steps-1)/steps 위치를 샘플링한다.
 * t=1은 포함하지 않는다.
 *
 * @param out 결과를 기록할 writable output 배열 (호출 전 내용은 덮어쓴다)
 * @param points control point 배열
 * @param stepsOrOptions 샘플 수 또는 옵션 객체
 */
export function catmullRomPolylineInto(
  out: XYWritable[],
  points: readonly XYInput[],
  stepsOrOptions?: number | CatmullRomPolylineOptions
): void {
  let steps = 32;
  let alpha = 0.5;
  let closed = false;

  if (typeof stepsOrOptions === 'number') {
    steps = stepsOrOptions;
  } else if (stepsOrOptions != null) {
    if (stepsOrOptions.steps != null) steps = stepsOrOptions.steps;
    if (stepsOrOptions.alpha != null) alpha = stepsOrOptions.alpha;
    if (stepsOrOptions.closed != null) closed = stepsOrOptions.closed;
  }

  if (points.length < 2) {
    out.length = 0;
    return;
  }

  if (steps <= 0) {
    out.length = 0;
    return;
  }

  if (steps === 1) {
    const pt = { x: 0, y: 0 };
    catmullRomPointAtTInto(pt, points, 0, { alpha, closed });
    out.length = 0;
    out.push(pt);
    return;
  }

  // steps >= 2: t = i/steps (i = 0, 1, ..., steps-1)
  out.length = 0;
  for (let i = 0; i < steps; i++) {
    const t = i / steps;
    const pt = { x: 0, y: 0 };
    catmullRomPointAtTInto(pt, points, t, { alpha, closed });
    out.push(pt);
  }
}
