import type { BSplineOptions, PathCommand, XYInput } from '../types';
import { bsplineGetPoints, bsplineSegmentCount } from './bspline.internal';

/**
 * uniform cubic B-Spline point list를 cubic Bezier PathCommand[] 로 변환한다.
 *
 * span이 0개 이하이면 out.length를 0으로 설정하고 반환한다.
 * open curve는 n ≥ 4, closed curve는 n ≥ 1이어야 span이 생긴다.
 *
 * @param out 결과를 기록할 PathCommand 배열 (내용이 덮어쓰인다)
 * @param points B-Spline 제어점 배열
 * @param options closed 여부 등 옵션
 * @returns out
 */
export function bsplinePathInto<Out extends PathCommand[]>(
  out: Out,
  points: readonly XYInput[],
  options?: BSplineOptions
): Out {
  const closed = options?.closed ?? false;
  const n = points.length;
  const spanCount = bsplineSegmentCount(n, closed);

  out.length = 0;
  if (spanCount <= 0) return out;

  for (let i = 0; i < spanCount; i++) {
    const [x0, y0, x1, y1, x2, y2, x3, y3] = bsplineGetPoints(points, i, closed);
    const c0x = (x0 + 4 * x1 + x2) / 6;
    const c0y = (y0 + 4 * y1 + y2) / 6;
    const c1x = (2 * x1 + x2) / 3;
    const c1y = (2 * y1 + y2) / 3;
    const c2x = (x1 + 2 * x2) / 3;
    const c2y = (y1 + 2 * y2) / 3;
    const c3x = (x1 + 4 * x2 + x3) / 6;
    const c3y = (y1 + 4 * y2 + y3) / 6;
    if (i === 0) out.push({ kind: 'move', x: c0x, y: c0y } as Out[number]);
    out.push({ kind: 'cubic', x1: c1x, y1: c1y, x2: c2x, y2: c2y, x: c3x, y: c3y } as Out[number]);
  }
  if (closed) out.push({ kind: 'close' } as Out[number]);
  return out;
}
