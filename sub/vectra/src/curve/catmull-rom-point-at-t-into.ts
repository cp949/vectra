import { readX, readY, writeXY } from '../internal/xy';
import type { CatmullRomOptions, XYInput, XYWritable } from '../types';
import { catmullRomKnotsFromPoints, catmullRomPointAtTByKnotsInto } from './catmull-rom.internal';

/**
 * Catmull-Rom 곡선 위의 t 위치 점을 out에 기록한다.
 *
 * @param out 결과를 기록할 writable output
 * @param points control point 배열
 * @param t 0~1 곡선 파라미터
 * @param options alpha, closed 옵션
 * @returns out
 */
export function catmullRomPointAtTInto<Out extends XYWritable>(
  out: Out,
  points: readonly XYInput[],
  t: number,
  options?: CatmullRomOptions
): Out {
  const n = points.length;

  if (n === 0) return writeXY(out, 0, 0);
  if (n === 1) return writeXY(out, readX(points[0]), readY(points[0]));

  const alpha = options?.alpha ?? 0.5;
  const closed = options?.closed ?? false;

  return catmullRomPointAtTByKnotsInto(out, points, catmullRomKnotsFromPoints(points, alpha, closed), t, closed);
}
