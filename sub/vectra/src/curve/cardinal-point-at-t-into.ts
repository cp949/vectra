import type { CardinalOptions } from '../types';
import type { Point, PointWritable } from '../types/flat-shapes.internal';
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
 * @param out 결과를 기록할 점 객체
 * @param points control point 배열
 * @param t 0~1 곡선 파라미터
 * @param options tension과 closed 옵션
 * @returns out
 */
export function cardinalPointAtTInto<Out extends PointWritable>(
  out: Out,
  points: readonly Point[],
  t: number,
  options?: Required<CardinalOptions>
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

  const tension = options === undefined ? 0 : options.tension;
  const closed = options === undefined ? false : options.closed;

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
