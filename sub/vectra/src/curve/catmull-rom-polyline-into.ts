import type { CatmullRomPolylineOptions } from '../types';
import type { Point, PointWritable } from '../types/flat-shapes.internal';
import { catmullRomPointAtTInto } from './catmull-rom-point-at-t-into';
import { catmullRomKnotsFromPoints, catmullRomPointAtTByKnotsInto } from './catmull-rom.internal';

/**
 * Catmull-Rom 곡선을 steps개 점으로 샘플링해 out에 기록한다.
 *
 * t = 0, 1/steps, 2/steps, ..., (steps-1)/steps 위치를 샘플링한다.
 * t=1은 포함하지 않는다.
 *
 * @param out 결과를 기록할 점 배열 (호출 전 내용은 덮어쓴다)
 * @param points control point 배열
 * @param options 샘플링 옵션. 생략하면 32점을 기록한다.
 * @returns 기록이 완료된 out (입력과 동일한 참조)
 */
export function catmullRomPolylineInto(
  out: PointWritable[],
  points: readonly Point[],
  options?: Required<CatmullRomPolylineOptions>
): PointWritable[] {
  const steps = options === undefined ? 32 : options.steps;
  const alpha = options === undefined ? 0.5 : options.alpha;
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
    catmullRomPointAtTInto(pt, points, 0, { alpha, closed });
    out.length = 0;
    out.push(pt);
    return out;
  }

  // steps >= 2: t = i/steps (i = 0, 1, ..., steps-1)
  // knot 표는 점 수에 비례한 비용이라 샘플마다 만들지 않고 한 번만 만든다.
  out.length = 0;
  let knots: number[] | undefined;
  for (let i = 0; i < steps; i++) {
    const t = i / steps;
    const pt = { x: 0, y: 0 };
    if (knots === undefined) knots = catmullRomKnotsFromPoints(points, alpha, closed);
    catmullRomPointAtTByKnotsInto(pt, points, knots, t, closed);
    out.push(pt);
  }
  return out;
}
