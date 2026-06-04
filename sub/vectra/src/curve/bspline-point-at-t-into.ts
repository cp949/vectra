import { readX, readY, writeXY } from '../internal/xy';
import type { BSplineOptions, XYInput, XYWritable } from '../types';
import { bsplineGetPoints, bsplineSegmentAt, bsplineSegmentCount } from './bspline.internal';

/**
 * uniform cubic B-Spline 곡선 위의 t 위치 점을 out에 기록한다.
 *
 * degenerate 처리:
 * - n=0: out에 {0, 0}을 기록한다.
 * - n=1: out에 points[0]을 기록한다.
 * - open 모드에서 n<4(spanCount=0): out에 points[0]을 기록한다.
 *
 * aliasing: out과 points 간 aliasing 허용. points는 읽기 전용으로만 접근하고
 * out에만 쓰므로 두 인자가 같은 객체를 참조해도 안전하다.
 *
 * @param out 결과를 기록할 writable output
 * @param points control point 배열
 * @param t 0~1 곡선 파라미터. 범위 외 값은 clamp하지 않으나 spanIndex를 [0, spanCount-1]로 clamp한다.
 * @param options closed 옵션
 * @returns out
 */
export function bsplinePointAtTInto<Out extends XYWritable>(
  out: Out,
  points: readonly XYInput[],
  t: number,
  options?: BSplineOptions
): Out {
  const n = points.length;

  if (n === 0) return writeXY(out, 0, 0);
  if (n === 1) return writeXY(out, readX(points[0]), readY(points[0]));

  const closed = options?.closed ?? false;
  const spanCount = bsplineSegmentCount(n, closed);

  if (spanCount <= 0) return writeXY(out, readX(points[0]), readY(points[0]));

  const raw = t * spanCount;
  const spanIndex = Math.max(0, Math.min(Math.floor(raw), spanCount - 1));
  const localT = raw - spanIndex;

  const [x0, y0, x1, y1, x2, y2, x3, y3] = bsplineGetPoints(points, spanIndex, closed);
  return bsplineSegmentAt(out, x0, y0, x1, y1, x2, y2, x3, y3, localT);
}
