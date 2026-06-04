import type { CatmullRomOptions, PathCommand, XYInput } from '../types';
import { catmullRomGetPoints, catmullRomKnotsFromPoints, catmullRomSegmentCount } from './catmull-rom.internal';

/**
 * Catmull-Rom 곡선을 cubic Bezier PathCommand[]로 변환한다.
 *
 * 각 segment의 접선 방향을 Barry-Goldman knot parametrization 기반의 공식으로
 * 계산하여 cubic Bezier control point로 변환한다.
 * 결과 PathCommand[]는 move → cubic... (→ close) 구조로 구성된다.
 *
 * n < 2이면 out.length를 0으로 설정하고 반환한다.
 *
 * @param out 결과를 기록할 writable output 배열
 * @param points 곡선이 통과할 보간 점 배열
 * @param options alpha(0=uniform, 0.5=centripetal, 1=chordal), closed 옵션
 * @returns out
 */
export function catmullRomPathInto<Out extends PathCommand[]>(
  out: Out,
  points: readonly XYInput[],
  options?: CatmullRomOptions
): Out {
  const alpha = options?.alpha ?? 0.5;
  const closed = options?.closed ?? false;
  const n = points.length;

  out.length = 0;
  if (n < 2) return out;

  const segCount = catmullRomSegmentCount(n, closed);
  const knots = catmullRomKnotsFromPoints(points, alpha, closed);

  // knots 배열: index 0=t_{-1}, index 1=t_0, ..., index n+1=t_n
  // safeKnot(i)는 segment loop에서 i = si..si+3 범위를 처리할 때
  // n+1을 초과하는 index를 extrapolation으로 보완한다.
  // open curve는 maxi segment si=n-2, t3=safeKnot(n+1)까지만 사용하므로 이 분기에 진입하지 않는다.
  // closed curve의 마지막 segment(si=n-1)에서만 safeKnot(n+2)를 요청한다.
  // wrap 기준 p[n] 이후 가상 구간은 p[0]→p[1] 간격(knots[2]-knots[1])과 동일하므로 해당 step으로 외삽한다.
  const safeKnot = (i: number): number => {
    if (i <= n + 1) return knots[i];
    const step = knots[2] - knots[1];
    return knots[n + 1] + step * (i - (n + 1));
  };

  for (let si = 0; si < segCount; si++) {
    const [x0, y0, x1, y1, x2, y2, x3, y3] = catmullRomGetPoints(points, si, closed);

    const t0 = safeKnot(si);
    const t1 = safeKnot(si + 1);
    const t2 = safeKnot(si + 2);
    const t3 = safeKnot(si + 3);

    const dt01 = t1 - t0;
    const dt12 = t2 - t1;
    const dt23 = t3 - t2;
    const dt02 = dt01 + dt12;
    const dt13 = dt12 + dt23;

    // p1, p2에서의 접선 벡터 (로컬 [0,1] 파라미터 기준으로 정규화)
    const T1x = ((x1 - x0) / dt01) * ((dt12 * dt12) / dt02) + (x2 - x1) * (dt01 / dt02);
    const T1y = ((y1 - y0) / dt01) * ((dt12 * dt12) / dt02) + (y2 - y1) * (dt01 / dt02);
    const T2x = (x2 - x1) * (dt23 / dt13) + ((x3 - x2) / dt23) * ((dt12 * dt12) / dt13);
    const T2y = (y2 - y1) * (dt23 / dt13) + ((y3 - y2) / dt23) * ((dt12 * dt12) / dt13);

    // cubic Bezier control point: c0=(x1,y1), c3=(x2,y2)
    const c1x = x1 + T1x / 3;
    const c1y = y1 + T1y / 3;
    const c2x = x2 - T2x / 3;
    const c2y = y2 - T2y / 3;

    if (si === 0) out.push({ kind: 'move', x: x1, y: y1 } as Out[number]);
    out.push({ kind: 'cubic', x1: c1x, y1: c1y, x2: c2x, y2: c2y, x: x2, y: y2 } as Out[number]);
  }
  if (closed) out.push({ kind: 'close' } as Out[number]);
  return out;
}
