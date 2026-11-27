import type { CardinalPolylineOptions } from '../types';
import type { Point, PointWritable } from '../types/flat-shapes.internal';
import { cardinalPointAtTInto } from './cardinal-point-at-t-into';

/**
 * Cardinal spline 곡선을 steps개 점으로 샘플링해 out에 기록한다.
 *
 * t = 0, 1/steps, 2/steps, ..., (steps-1)/steps 위치를 샘플링한다.
 * t=1은 포함하지 않는다.
 *
 * degenerate 처리:
 * - points.length < 2 → out을 비운다.
 * - steps <= 0 → out을 비운다.
 * - steps === 1 → t=0 한 점만 push한다.
 *
 * @param out 결과를 기록할 점 배열 (호출 전 내용은 덮어쓴다)
 * @param points control point 배열
 * @param options 샘플링 옵션. 생략하면 32점을 기록한다.
 * @returns 기록이 완료된 out (입력과 동일한 참조)
 */
export function cardinalPolylineInto(
  out: PointWritable[],
  points: readonly Point[],
  options?: Required<CardinalPolylineOptions>
): PointWritable[] {
  const steps = options === undefined ? 32 : options.steps;
  const tension = options === undefined ? 0 : options.tension;
  const closed = options === undefined ? false : options.closed;

  if (points.length < 2) {
    out.length = 0;
    return out;
  }

  if (steps <= 0) {
    out.length = 0;
    return out;
  }

  if (steps === 1) {
    const pt = { x: 0, y: 0 };
    cardinalPointAtTInto(pt, points, 0, { tension, closed });
    out.length = 0;
    out.push(pt);
    return out;
  }

  // steps >= 2: t = i/steps (i = 0, 1, ..., steps-1)
  out.length = 0;
  for (let i = 0; i < steps; i++) {
    const t = i / steps;
    const pt = { x: 0, y: 0 };
    cardinalPointAtTInto(pt, points, t, { tension, closed });
    out.push(pt);
  }
  return out;
}
