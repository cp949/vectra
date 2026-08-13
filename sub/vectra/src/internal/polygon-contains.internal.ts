import type { XYInput } from '../types';
import { polygonBoundaryDistance } from './polygon-boundary-closest.internal';
import { readX, readY } from './xy';

/**
 * ray casting으로 (px, py)가 polygon 내부에 있는지 판정한다.
 *
 * closed boundary 정책: edge 위에 있으면 true. epsilon은 boundary proximity threshold다.
 * 호출자가 `pts.length >= 3`을 보장해야 한다.
 *
 * horizontal edge와 vertex crossing의 double-count 방지: lower-left rule을 적용한다.
 * edge의 두 y값 중 작은 값이 py와 같을 때만 crossing으로 계산한다.
 *
 * @param pts polygon vertex 배열 (closed)
 * @param px 판정할 point의 x 좌표
 * @param py 판정할 point의 y 좌표
 * @param epsilon boundary proximity threshold
 */
export function polygonContainsPoint(pts: readonly XYInput[], px: number, py: number, epsilon: number): boolean {
  const n = pts.length;

  // 먼저 boundary check (epsilon 포함)
  if (polygonBoundaryDistance(pts, px, py, null) <= epsilon) return true;

  // ray casting (interior check)
  // +x 방향 반직선을 쏘고 crossing 수가 홀수이면 내부
  let inside = false;
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n;
    const ay = readY(pts[i]);
    const by = readY(pts[j]);
    // lower-left rule: y 범위에서 py를 포함하고, 교점이 px보다 오른쪽이면 crossing
    if ((ay <= py && by > py) || (by <= py && ay > py)) {
      const ax = readX(pts[i]);
      const bx = readX(pts[j]);
      // weighted interpolation은 `bx - ax` overflow를 피한다.
      const t = (py - ay) / (by - ay);
      const xCross = ax * (1 - t) + bx * t;
      if (xCross > px) inside = !inside;
    }
  }
  return inside;
}

/**
 * 두 segment (ax,ay)→(bx,by)와 (cx,cy)→(dx,dy)가 교차하는지 판정한다.
 *
 * endpoint touch와 collinear overlap을 모두 교차로 인정한다. parallel하지만 collinear가
 * 아니면 false다. degenerate point segment(segment A의 길이가 0)인 경우는 collinear 분기에서
 * false를 반환하므로 polygon edge × segment/rect edge 교차 판정 용도로만 사용한다.
 *
 * @param ax segment A 시작점 x
 * @param ay segment A 시작점 y
 * @param bx segment A 끝점 x
 * @param by segment A 끝점 y
 * @param cx segment B 시작점 x
 * @param cy segment B 시작점 y
 * @param dx segment B 끝점 x
 * @param dy segment B 끝점 y
 */
export function segmentsIntersect(
  ax: number,
  ay: number,
  bx: number,
  by: number,
  cx: number,
  cy: number,
  dx: number,
  dy: number
): boolean {
  const dAx = bx - ax;
  const dAy = by - ay;
  const dBx = dx - cx;
  const dBy = dy - cy;
  const denom = dAx * dBy - dAy * dBx;
  const qx = cx - ax;
  const qy = cy - ay;

  if (denom === 0) {
    // parallel: collinear overlap check
    const collinearCross = dAx * qy - dAy * qx;
    if (collinearCross !== 0) return false;
    const lenSqA = dAx * dAx + dAy * dAy;
    if (lenSqA === 0) return false;
    const tC = (qx * dAx + qy * dAy) / lenSqA;
    const tD = ((dx - ax) * dAx + (dy - ay) * dAy) / lenSqA;
    const lo = Math.min(tC, tD);
    const hi = Math.max(tC, tD);
    return lo <= 1 && hi >= 0;
  }

  const t = (qx * dBy - qy * dBx) / denom;
  const u = (qx * dAy - qy * dAx) / denom;
  return t >= 0 && t <= 1 && u >= 0 && u <= 1;
}
