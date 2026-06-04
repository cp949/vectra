import { readX, readY, writeXY } from '../internal/xy';
import type { XYInput, XYWritable } from '../types';

/**
 * uniform cubic B-Spline의 span 수를 반환한다.
 *
 * open: Math.max(0, n-3), closed: Math.max(0, n).
 *
 * @param n control point 수
 * @param closed true이면 closed loop curve
 * @returns span 수
 */
export function bsplineSegmentCount(n: number, closed: boolean): number {
  return closed ? Math.max(0, n) : Math.max(0, n - 3);
}

/**
 * spanIndex번째 span의 4개 제어점을 flat number[8]로 반환한다.
 *
 * open span i: p[i], p[i+1], p[i+2], p[i+3].
 * closed span i: ((i+k) % n + n) % n 패턴으로 wrap-around.
 *
 * @param points control point 배열
 * @param spanIndex span index (0-based)
 * @param closed true이면 closed loop curve
 * @returns [x0, y0, x1, y1, x2, y2, x3, y3]
 */
export function bsplineGetPoints(
  points: readonly XYInput[],
  spanIndex: number,
  closed: boolean
): [number, number, number, number, number, number, number, number] {
  const n = points.length;

  if (closed) {
    const i0 = ((spanIndex % n) + n) % n;
    const i1 = (((spanIndex + 1) % n) + n) % n;
    const i2 = (((spanIndex + 2) % n) + n) % n;
    const i3 = (((spanIndex + 3) % n) + n) % n;
    return [
      readX(points[i0]),
      readY(points[i0]),
      readX(points[i1]),
      readY(points[i1]),
      readX(points[i2]),
      readY(points[i2]),
      readX(points[i3]),
      readY(points[i3]),
    ];
  }

  const i = spanIndex;
  return [
    readX(points[i]),
    readY(points[i]),
    readX(points[i + 1]),
    readY(points[i + 1]),
    readX(points[i + 2]),
    readY(points[i + 2]),
    readX(points[i + 3]),
    readY(points[i + 3]),
  ];
}

/**
 * uniform cubic B-Spline basis로 t 위치의 점을 out에 기록한다.
 *
 * N0(t) = (1/6)(1-t)^3
 * N1(t) = (1/6)(3t^3 - 6t^2 + 4)
 * N2(t) = (1/6)(-3t^3 + 3t^2 + 3t + 1)
 * N3(t) = (1/6)t^3
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
 * @param t span local 파라미터 [0, 1]
 * @returns out
 */
export function bsplineSegmentAt<Out extends XYWritable>(
  out: Out,
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  x3: number,
  y3: number,
  t: number
): Out {
  const t2 = t * t;
  const t3 = t2 * t;
  const n0 = (1 / 6) * (1 - t) ** 3;
  const n1 = (1 / 6) * (3 * t3 - 6 * t2 + 4);
  const n2 = (1 / 6) * (-3 * t3 + 3 * t2 + 3 * t + 1);
  const n3 = (1 / 6) * t3;
  const rx = n0 * x0 + n1 * x1 + n2 * x2 + n3 * x3;
  const ry = n0 * y0 + n1 * y1 + n2 * y2 + n3 * y3;
  return writeXY(out, rx, ry);
}
