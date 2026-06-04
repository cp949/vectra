import { readX, readY, writeXY } from '../internal/xy';
import type { CardinalOptions, XYInput, XYWritable } from '../types';
import { cardinalGetPoints, cardinalSegmentAt, clampCardinalTension } from './cardinal.internal';

/**
 * Cardinal spline 곡선 위의 t 위치 점을 out에 기록한다.
 *
 * degenerate 처리:
 * - n=0: out에 {0, 0}을 기록한다.
 * - n=1: out에 points[0]을 기록한다.
 *
 * t mapping:
 * - open: raw = t * (n-1), segIndex = clamp(floor(raw), 0, n-2)
 * - closed: raw = t * n, segIndex = clamp(floor(raw), 0, n-1)
 * clamp 후 localT를 재계산해 t=0/1 경계에서 첫/끝 점을 정확히 반환한다.
 *
 * @param out 결과를 기록할 writable output
 * @param points control point 배열
 * @param t 0~1 곡선 파라미터
 * @param tensionOrOptions tension number 또는 CardinalOptions
 * @returns out
 */
export function cardinalPointAtTInto<Out extends XYWritable>(
  out: Out,
  points: readonly XYInput[],
  t: number,
  tensionOrOptions?: number | CardinalOptions
): Out {
  const n = points.length;

  if (n === 0) return writeXY(out, 0, 0);
  if (n === 1) return writeXY(out, readX(points[0]), readY(points[0]));

  const tension = typeof tensionOrOptions === 'number' ? tensionOrOptions : (tensionOrOptions?.tension ?? 0);
  const closed = typeof tensionOrOptions === 'number' ? false : (tensionOrOptions?.closed ?? false);

  const clampedTension = clampCardinalTension(tension);

  let segIndex: number;
  let localT: number;

  if (closed) {
    const raw = t * n;
    // clamp 후 localT 재계산으로 t=0/1 경계 정확도 보장
    segIndex = Math.max(0, Math.min(Math.floor(raw), n - 1));
    localT = raw - segIndex;
  } else {
    const raw = t * (n - 1);
    // clamp 후 localT 재계산으로 t=1 경계에서 마지막 점을 정확히 반환한다
    segIndex = Math.max(0, Math.min(Math.floor(raw), n - 2));
    localT = raw - segIndex;
  }

  const [x0, y0, x1, y1, x2, y2, x3, y3] = cardinalGetPoints(points, segIndex, closed);
  return cardinalSegmentAt(out, x0, y0, x1, y1, x2, y2, x3, y3, localT, clampedTension);
}
