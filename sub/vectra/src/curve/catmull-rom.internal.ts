import { readX, readY, writeXY } from '../internal/xy';
import type { XYInput, XYWritable } from '../types';

/** open/closed curve에서 index i의 x 좌표를 반환한다. 범위 밖 index는 phantom/wrap 처리. */
function resolveX(points: readonly XYInput[], i: number, n: number, closed: boolean): number {
  if (closed) {
    return readX(points[((i % n) + n) % n]);
  }
  if (i < 0) return 2 * readX(points[0]) - readX(points[1]);
  if (i >= n) return 2 * readX(points[n - 1]) - readX(points[n - 2]);
  return readX(points[i]);
}

/** open/closed curve에서 index i의 y 좌표를 반환한다. 범위 밖 index는 phantom/wrap 처리. */
function resolveY(points: readonly XYInput[], i: number, n: number, closed: boolean): number {
  if (closed) {
    return readY(points[((i % n) + n) % n]);
  }
  if (i < 0) return 2 * readY(points[0]) - readY(points[1]);
  if (i >= n) return 2 * readY(points[n - 1]) - readY(points[n - 2]);
  return readY(points[i]);
}

/**
 * open이면 n-1, closed이면 n을 반환한다.
 *
 * @param n control point 수
 * @param closed true이면 closed loop curve
 * @returns segment 수
 */
export function catmullRomSegmentCount(n: number, closed: boolean): number {
  return closed ? n : n - 1;
}

/**
 * segIndex번째 segment의 4개 제어점을 flat number[8]로 반환한다.
 *
 * open curve phantom 규칙: p[-1]=2*p[0]-p[1], p[n]=2*p[n-1]-p[n-2].
 * closed curve wrap 규칙: index를 modulo n으로 정규화한다.
 *
 * @param points control point 배열
 * @param segIndex segment index (0-based)
 * @param closed true이면 closed loop curve
 * @returns [x0, y0, x1, y1, x2, y2, x3, y3]
 */
export function catmullRomGetPoints(
  points: readonly XYInput[],
  segIndex: number,
  closed: boolean
): [number, number, number, number, number, number, number, number] {
  const n = points.length;

  // segIndex에서 4점: p[-1+segIndex], p[segIndex], p[1+segIndex], p[2+segIndex]
  const i0 = segIndex - 1;
  const i1 = segIndex;
  const i2 = segIndex + 1;
  const i3 = segIndex + 2;

  return [
    resolveX(points, i0, n, closed),
    resolveY(points, i0, n, closed),
    resolveX(points, i1, n, closed),
    resolveY(points, i1, n, closed),
    resolveX(points, i2, n, closed),
    resolveY(points, i2, n, closed),
    resolveX(points, i3, n, closed),
    resolveY(points, i3, n, closed),
  ];
}

/**
 * centripetal knot 배열을 계산한다.
 *
 * phantom point를 포함해 n+2개 knot을 반환한다.
 * knot[0] = t_{-1}(phantom p[-1]), knot[1] = t_0(첫 번째 실제 점).
 * alpha=0이면 uniform(모든 간격=1).
 * 동일 점(dist=0)이면 간격을 1e-10으로 보정해 division-by-zero를 방지한다.
 *
 * @param points control point 배열
 * @param alpha centripetal 파라미터 (0=uniform, 0.5=centripetal, 1=chordal)
 * @param closed true이면 closed loop curve
 * @returns phantom 포함 n+2개 knot 배열
 */
export function catmullRomKnotsFromPoints(points: readonly XYInput[], alpha: number, closed: boolean): number[] {
  const n = points.length;

  // phantom 포함 n+2개 knot 생성.
  // 인덱스 0: t_{-1}(phantom p[-1]), 인덱스 1: t_0=0(실제 p[0]), ..., 인덱스 n+1: t_n(phantom p[n])
  // knots[1]=0 고정: p[0]에 대응하는 knot이 정확히 0이 되도록 한다.
  const knots: number[] = new Array(n + 2);
  knots[1] = 0; // t_0 = 0 고정

  // phantom → p[0] 간격: knots[0] = 0 - interval (음수)
  {
    const ax = resolveX(points, -1, n, closed);
    const ay = resolveY(points, -1, n, closed);
    const bx = resolveX(points, 0, n, closed);
    const by = resolveY(points, 0, n, closed);
    const dx = bx - ax;
    const dy = by - ay;
    const dist = Math.hypot(dx, dy);
    const clampedDist = Math.max(dist, 1e-10);
    const interval = clampedDist ** alpha;
    knots[0] = knots[1] - interval; // t_{-1} = -interval
  }

  // p[0]→p[n-1], p[n-1]→phantom: knots[2..n+1] 누적
  for (let k = 0; k < n; k++) {
    const ax = resolveX(points, k, n, closed);
    const ay = resolveY(points, k, n, closed);
    const bx = resolveX(points, k + 1, n, closed);
    const by = resolveY(points, k + 1, n, closed);
    const dx = bx - ax;
    const dy = by - ay;
    const dist = Math.hypot(dx, dy);
    const clampedDist = Math.max(dist, 1e-10);
    const interval = clampedDist ** alpha;
    knots[k + 2] = knots[k + 1] + interval;
  }

  return knots;
}

/**
 * Barry-Goldman 4점 보간으로 global knot domain 값 u에서의 점을 out에 기록한다.
 *
 * u: t1 ≤ u ≤ t2 범위의 global knot domain 값.
 *
 * @param out 결과를 기록할 writable output
 * @param x0 p0 x 좌표
 * @param y0 p0 y 좌표
 * @param x1 p1 x 좌표
 * @param y1 p1 y 좌표
 * @param x2 p2 x 좌표
 * @param y2 p2 y 좌표
 * @param x3 p3 x 좌표
 * @param y3 p3 y 좌표
 * @param u 보간 위치 (global knot domain)
 * @param t0 p0에 대응하는 knot 값
 * @param t1 p1에 대응하는 knot 값
 * @param t2 p2에 대응하는 knot 값
 * @param t3 p3에 대응하는 knot 값
 * @returns out
 */
export function catmullRomSegmentAt<Out extends XYWritable>(
  out: Out,
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  x3: number,
  y3: number,
  u: number,
  t0: number,
  t1: number,
  t2: number,
  t3: number
): Out {
  // Barry-Goldman 공식: 3단계 선형 보간으로 non-uniform Catmull-Rom 점을 계산한다.
  const dt01 = t1 - t0;
  const dt12 = t2 - t1;
  const dt23 = t3 - t2;
  const dt02 = t2 - t0;
  const dt13 = t3 - t1;

  // 1단계: 인접 점 쌍 보간
  const L01x = x0 + ((x1 - x0) * (u - t0)) / dt01;
  const L01y = y0 + ((y1 - y0) * (u - t0)) / dt01;
  const L12x = x1 + ((x2 - x1) * (u - t1)) / dt12;
  const L12y = y1 + ((y2 - y1) * (u - t1)) / dt12;
  const L23x = x2 + ((x3 - x2) * (u - t2)) / dt23;
  const L23y = y2 + ((y3 - y2) * (u - t2)) / dt23;

  // 2단계: 3점 쌍 보간
  const L012x = L01x + ((L12x - L01x) * (u - t0)) / dt02;
  const L012y = L01y + ((L12y - L01y) * (u - t0)) / dt02;
  const L123x = L12x + ((L23x - L12x) * (u - t1)) / dt13;
  const L123y = L12y + ((L23y - L12y) * (u - t1)) / dt13;

  // 3단계: 최종 보간
  const resultX = L012x + ((L123x - L012x) * (u - t1)) / dt12;
  const resultY = L012y + ((L123y - L012y) * (u - t1)) / dt12;

  return writeXY(out, resultX, resultY);
}
