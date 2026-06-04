import type { CardinalOptions, PathCommand, XYInput } from '../types';
import {
  cardinalGetPoints,
  cardinalSegmentCount,
  cardinalSegmentToCubic,
  clampCardinalTension,
} from './cardinal.internal';

/**
 * Cardinal spline 곡선을 cubic Bezier PathCommand[]로 변환한다.
 *
 * 각 segment의 접선 방향을 cardinal hermite 공식으로 계산하여
 * cubic Bezier control point로 변환한다.
 * 결과 PathCommand[]는 move → cubic... (→ close) 구조로 구성된다.
 *
 * n < 2이면 out.length를 0으로 설정하고 반환한다.
 *
 * @param out 결과를 기록할 writable output 배열
 * @param points 곡선이 통과할 보간 점 배열
 * @param options tension(0=기본), closed 옵션
 * @returns out
 */
export function cardinalPathInto<Out extends PathCommand[]>(
  out: Out,
  points: readonly XYInput[],
  options?: CardinalOptions
): Out {
  const tension = options?.tension ?? 0;
  const closed = options?.closed ?? false;
  const n = points.length;

  out.length = 0;
  if (n < 2) return out;

  const clampedTension = clampCardinalTension(tension);
  const segCount = cardinalSegmentCount(n, closed);

  for (let si = 0; si < segCount; si++) {
    const [x0, y0, x1, y1, x2, y2, x3, y3] = cardinalGetPoints(points, si, closed);
    const [, , c1x, c1y, c2x, c2y, c3x, c3y] = cardinalSegmentToCubic(x0, y0, x1, y1, x2, y2, x3, y3, clampedTension);

    if (si === 0) out.push({ kind: 'move', x: x1, y: y1 } as Out[number]);
    out.push({ kind: 'cubic', x1: c1x, y1: c1y, x2: c2x, y2: c2y, x: c3x, y: c3y } as Out[number]);
  }
  if (closed) out.push({ kind: 'close' } as Out[number]);
  return out;
}
