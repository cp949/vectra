import type { CatmullRomOptions } from '../types';
import type { Point, PointWritable } from '../types/flat-shapes.internal';
import { catmullRomKnotsFromPoints, catmullRomPointAtTByKnotsInto } from './catmull-rom.internal';

/**
 * Catmull-Rom 곡선 위의 t 위치 점을 out에 기록한다.
 *
 * @param out 결과를 기록할 점 객체
 * @param points control point 배열
 * @param t 0~1 곡선 파라미터
 * @param options alpha, closed 옵션
 * @returns out
 */
export function catmullRomPointAtTInto<Out extends PointWritable>(
  out: Out,
  points: readonly Point[],
  t: number,
  options?: Required<CatmullRomOptions>
): Out {
  const n = points.length;

  if (n === 0) {
    out.x = 0;
    out.y = 0;
    return out;
  }
  if (n === 1) {
    out.x = points[0].x;
    out.y = points[0].y;
    return out;
  }

  const alpha = options === undefined ? 0.5 : options.alpha;
  const closed = options === undefined ? false : options.closed;

  return catmullRomPointAtTByKnotsInto(out, points, catmullRomKnotsFromPoints(points, alpha, closed), t, closed);
}
