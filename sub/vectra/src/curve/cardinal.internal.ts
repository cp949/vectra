import { readX, readY, writeXY } from '../internal/xy';
import type { XYInput, XYWritable } from '../types';

/** tension을 [0, 1]로 clamp한다. */
export function clampCardinalTension(tension: number): number {
  return Math.max(0, Math.min(1, tension));
}

/**
 * open이면 n-1, closed이면 n을 반환한다.
 *
 * @param n control point 수
 * @param closed true이면 closed loop curve
 * @returns segment 수
 */
export function cardinalSegmentCount(n: number, closed: boolean): number {
  return closed ? n : n - 1;
}

/**
 * segIndex번째 segment의 4개 제어점을 flat number[8]로 반환한다.
 *
 * open phantom 규칙: p[-1]=2*p[0]-p[1], p[n]=2*p[n-1]-p[n-2].
 * closed wrap 규칙: index를 modulo n으로 정규화한다.
 *
 * @param points control point 배열
 * @param segIndex segment index (0-based)
 * @param closed true이면 closed loop curve
 * @returns [x0, y0, x1, y1, x2, y2, x3, y3] — p0..p3 순서
 */
export function cardinalGetPoints(
  points: readonly XYInput[],
  segIndex: number,
  closed: boolean
): [number, number, number, number, number, number, number, number] {
  const n = points.length;

  // segment i는 p[i]→p[i+1]을 그린다. p0=p[i-1], p1=p[i], p2=p[i+1], p3=p[i+2].
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
 * cardinal spline hermite basis로 localT 위치의 점을 out에 기록한다.
 *
 * s = (1 - tension) / 2
 * m1 = s*(p2 - p0), m2 = s*(p3 - p1)
 * result = h00*p1 + h10*m1 + h01*p2 + h11*m2
 *
 * @param out 결과를 기록할 writable output
 * @param x0 p0 x 좌표 (이전 점)
 * @param y0 p0 y 좌표
 * @param x1 p1 x 좌표 (segment 시작점)
 * @param y1 p1 y 좌표
 * @param x2 p2 x 좌표 (segment 끝점)
 * @param y2 p2 y 좌표
 * @param x3 p3 x 좌표 (다음 점)
 * @param y3 p3 y 좌표
 * @param localT segment local 파라미터 [0, 1]
 * @param tension tangent scale 계수 [0, 1]
 * @returns out
 */
export function cardinalSegmentAt<Out extends XYWritable>(
  out: Out,
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  x3: number,
  y3: number,
  localT: number,
  tension: number
): Out {
  const s = (1 - tension) / 2;
  const t2 = localT * localT;
  const t3 = t2 * localT;

  // hermite basis function
  const h00 = 2 * t3 - 3 * t2 + 1;
  const h10 = t3 - 2 * t2 + localT;
  const h01 = -2 * t3 + 3 * t2;
  const h11 = t3 - t2;

  // tangent
  const m1x = s * (x2 - x0);
  const m1y = s * (y2 - y0);
  const m2x = s * (x3 - x1);
  const m2y = s * (y3 - y1);

  const rx = h00 * x1 + h10 * m1x + h01 * x2 + h11 * m2x;
  const ry = h00 * y1 + h10 * m1y + h01 * y2 + h11 * m2y;

  return writeXY(out, rx, ry);
}

/**
 * cardinal spline segment를 등가 cubic Bezier 제어점으로 변환한다.
 *
 * s = (1 - tension) / 2
 * c0 = p1
 * c1 = p1 + s*(p2 - p0) / 3
 * c2 = p2 - s*(p3 - p1) / 3
 * c3 = p2
 *
 * @param x0 p0 x 좌표
 * @param y0 p0 y 좌표
 * @param x1 p1 x 좌표 (segment 시작점)
 * @param y1 p1 y 좌표
 * @param x2 p2 x 좌표 (segment 끝점)
 * @param y2 p2 y 좌표
 * @param x3 p3 x 좌표
 * @param y3 p3 y 좌표
 * @param tension tangent scale 계수 [0, 1]
 * @returns [c0x, c0y, c1x, c1y, c2x, c2y, c3x, c3y]
 */
export function cardinalSegmentToCubic(
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  x3: number,
  y3: number,
  tension: number
): [number, number, number, number, number, number, number, number] {
  const s = (1 - tension) / 2;
  const c0x = x1;
  const c0y = y1;
  const c1x = x1 + (s * (x2 - x0)) / 3;
  const c1y = y1 + (s * (y2 - y0)) / 3;
  const c2x = x2 - (s * (x3 - x1)) / 3;
  const c2y = y2 - (s * (y3 - y1)) / 3;
  const c3x = x2;
  const c3y = y2;
  return [c0x, c0y, c1x, c1y, c2x, c2y, c3x, c3y];
}

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
