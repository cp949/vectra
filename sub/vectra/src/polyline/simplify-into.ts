import { readPolylinePoints } from '../internal/polyline';
import { readX, readY } from '../internal/xy';
import type { PolylineLike, XYObjectWritable } from '../types';

/**
 * segment (ax,ay)→(bx,by)에 대한 point (px,py)의 수직 거리 제곱을 반환한다.
 *
 * zero-length segment는 point와 a 사이 거리 제곱을 반환한다.
 */
function perpendicularDistSq(px: number, py: number, ax: number, ay: number, bx: number, by: number): number {
  const dx = bx - ax;
  const dy = by - ay;
  const lenSq = dx * dx + dy * dy;
  if (lenSq === 0) {
    const ex = px - ax;
    const ey = py - ay;
    return ex * ex + ey * ey;
  }
  // point → line 수선 거리 제곱
  const t = ((px - ax) * dx + (py - ay) * dy) / lenSq;
  const cx = ax + t * dx - px;
  const cy = ay + t * dy - py;
  return cx * cx + cy * cy;
}

/**
 * Ramer-Douglas-Peucker 알고리즘으로 polyline을 단순화해 outPoints에 기록한다.
 *
 * outPoints는 먼저 clear된 뒤 결과 point가 push되며, 같은 outPoints를 반환한다.
 * polyline point array와 outPoints가 같은 배열이어도 안전하다.
 * open polyline semantics 전용. closed polygon simplification은 다루지 않는다.
 *
 * `tolerance`는 절대 거리 단위 기본값 1.0이다. `tolerance < 0`이면 RangeError를 던진다.
 * `tolerance === 0`은 허용하며, 동일선상에 없는 모든 point를 유지한다.
 *
 * empty polyline이면 outPoints를 비우고 반환한다. single-point이면 그 점만 push한다.
 *
 * @param outPoints 단순화된 point object를 기록할 writable output array
 * @param polyline 단순화할 polyline
 * @param tolerance 허용 최대 수직 거리 (기본값 1.0)
 */
export function simplifyInto(
  outPoints: XYObjectWritable[],
  polyline: PolylineLike,
  tolerance = 1.0
): XYObjectWritable[] {
  if (tolerance < 0) {
    throw new RangeError('tolerance must be >= 0');
  }

  const pts = readPolylinePoints(polyline);
  const n = pts.length;

  if (n === 0) {
    outPoints.length = 0;
    return outPoints;
  }

  // 좌표를 snapshot
  const xs: number[] = new Array(n);
  const ys: number[] = new Array(n);
  for (let i = 0; i < n; i++) {
    xs[i] = readX(pts[i]);
    ys[i] = readY(pts[i]);
  }

  outPoints.length = 0;

  if (n === 1) {
    outPoints.push({ x: xs[0], y: ys[0] });
    return outPoints;
  }

  const tolSq = tolerance * tolerance;

  // 반복적(iterative) stack 방식 RDP
  // keep[i] = true이면 최종 결과에 포함
  const keep: boolean[] = new Array(n).fill(false);
  keep[0] = true;
  keep[n - 1] = true;

  // stack은 처리할 구간 [start, end] 쌍
  const stack: number[] = [0, n - 1];

  while (stack.length > 0) {
    const end = stack.pop() as number;
    const start = stack.pop() as number;

    if (end - start <= 1) continue;

    let maxDistSq = 0;
    let maxIdx = start;

    const ax = xs[start];
    const ay = ys[start];
    const bx = xs[end];
    const by = ys[end];

    for (let i = start + 1; i < end; i++) {
      const d = perpendicularDistSq(xs[i], ys[i], ax, ay, bx, by);
      if (d > maxDistSq) {
        maxDistSq = d;
        maxIdx = i;
      }
    }

    if (maxDistSq > tolSq) {
      keep[maxIdx] = true;
      stack.push(start, maxIdx);
      stack.push(maxIdx, end);
    }
  }

  for (let i = 0; i < n; i++) {
    if (keep[i]) {
      outPoints.push({ x: xs[i], y: ys[i] });
    }
  }

  return outPoints;
}
