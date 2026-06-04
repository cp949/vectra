import { readX, readY, writeXY } from '../internal/xy';
import type { CatmullRomOptions, XYInput, XYWritable } from '../types';
import {
  catmullRomGetPoints,
  catmullRomKnotsFromPoints,
  catmullRomSegmentAt,
  catmullRomSegmentCount,
} from './catmull-rom.internal';

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

  const segCount = catmullRomSegmentCount(n, closed);

  let segIndex: number;
  let localU: number;

  if (closed) {
    const raw = t * n;
    // clamp 후 segIndex로 localU를 재계산해 경계 처리 정확도를 보장한다
    segIndex = Math.max(0, Math.min(Math.floor(raw), segCount - 1));
    localU = raw - segIndex;
  } else {
    const raw = t * (n - 1);
    // clamp 후 segIndex로 localU를 재계산해 t=1 경계에서 마지막 점을 정확히 반환한다
    segIndex = Math.max(0, Math.min(Math.floor(raw), n - 2));
    localU = raw - segIndex;
  }

  const knots = catmullRomKnotsFromPoints(points, alpha, closed);

  // knots 크기: n+2 (인덱스 0~n+1).
  // closed에서 segIndex=n-1이면 knots[segIndex+3]=knots[n+2]가 범위를 벗어난다.
  // 이 경우 주기성을 이용해 p[k]→p[k+1] 간격(knots[k+2]-knots[k+1])으로 extrapolation한다.
  const safeKnot = (i: number): number => {
    if (i <= n + 1) return knots[i];
    // i = n+2: p[0]→p[1] 간격을 knots[n+1]에 누적
    const step = knots[2] - knots[1]; // p[0]→p[1] 간격
    return knots[n + 1] + step * (i - (n + 1));
  };

  // knots[0] = t_{-1}(phantom), knots[1] = t_0, ..., knots[segIndex+1] = t_{segIndex}
  const t1 = safeKnot(segIndex + 1);
  const t2 = safeKnot(segIndex + 2);
  const u = t1 + localU * (t2 - t1);

  const [x0, y0, x1, y1, x2, y2, x3, y3] = catmullRomGetPoints(points, segIndex, closed);

  const t0 = safeKnot(segIndex);
  const t3 = safeKnot(segIndex + 3);

  return catmullRomSegmentAt(out, x0, y0, x1, y1, x2, y2, x3, y3, u, t0, t1, t2, t3);
}
