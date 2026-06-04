import type { PolygonLike, XYInput } from '../types';
import { readX, readY } from './xy';

function isPolygonPointArray(polygon: PolygonLike): polygon is readonly XYInput[] {
  return Array.isArray(polygon);
}

/**
 * PolygonLike에서 single outer ring point array를 읽는다.
 *
 * array 자체를 넘긴 input은 그대로 사용하고, canonical object shape는 points field를 사용한다.
 *
 * @param polygon point array로 해석할 polygon input
 */
export function readPolygonPoints(polygon: PolygonLike): readonly XYInput[] {
  if (isPolygonPointArray(polygon)) return polygon;
  return polygon.points;
}

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

/**
 * point (px, py)가 axis-aligned rect 안에 있는지 판정한다.
 *
 * closed boundary 정책. empty rect(width <= 0 또는 height <= 0)는 false.
 *
 * @param rx rect의 x (left)
 * @param ry rect의 y (top)
 * @param rw rect의 width
 * @param rh rect의 height
 * @param px point x
 * @param py point y
 */
export function rectContainsPointXY(rx: number, ry: number, rw: number, rh: number, px: number, py: number): boolean {
  if (rw <= 0 || rh <= 0) return false;
  return px >= rx && px <= rx + rw && py >= ry && py <= ry + rh;
}

/**
 * point (px, py)가 axis-aligned bounds 안에 있는지 판정한다.
 *
 * closed boundary 정책. inverted bounds(min > max)는 false.
 *
 * @param minX bounds min x
 * @param minY bounds min y
 * @param maxX bounds max x
 * @param maxY bounds max y
 * @param px point x
 * @param py point y
 */
export function boundsContainsPointXY(
  minX: number,
  minY: number,
  maxX: number,
  maxY: number,
  px: number,
  py: number
): boolean {
  if (maxX < minX || maxY < minY) return false;
  return px >= minX && px <= maxX && py >= minY && py <= maxY;
}

/**
 * shoelace formula로 polygon points의 2배 signed area를 반환한다.
 *
 * 결과를 2로 나누면 signed area가 된다. 호출자가 points.length >= 3를 보장해야 한다.
 *
 * @param points signed area를 계산할 polygon vertex 목록
 */
export function shoelace2x(points: readonly XYInput[]): number {
  let sum = 0;
  const n = points.length;
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n;
    sum += readX(points[i]) * readY(points[j]) - readX(points[j]) * readY(points[i]);
  }
  return sum;
}

/**
 * polygon closest point 계산 helper가 closest 좌표를 기록할 mutable scratch.
 *
 * closestPointInto는 cx/cy를 모두 사용하지만 distanceToPoint는 무시한다. helper에 null을
 * 전달하면 좌표를 기록하지 않고 squared distance만 계산한다.
 */
export interface PolygonClosestScratch {
  cx: number;
  cy: number;
}

function polygonBoundaryClosestDistance(
  pts: readonly XYInput[],
  px: number,
  py: number,
  outScratch: PolygonClosestScratch | null
): number {
  const n = pts.length;
  let bestX = 0;
  let bestY = 0;
  let bestDistance = Infinity;

  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n;
    const ax = readX(pts[i]);
    const ay = readY(pts[i]);
    const bx = readX(pts[j]);
    const by = readY(pts[j]);
    const scale = Math.max(Math.abs(ax), Math.abs(ay), Math.abs(bx), Math.abs(by), Math.abs(px), Math.abs(py));
    const sax = scale === 0 ? ax : ax / scale;
    const say = scale === 0 ? ay : ay / scale;
    const sbx = scale === 0 ? bx : bx / scale;
    const sby = scale === 0 ? by : by / scale;
    const spx = scale === 0 ? px : px / scale;
    const spy = scale === 0 ? py : py / scale;
    const dx = sbx - sax;
    const dy = sby - say;
    const lenSq = dx * dx + dy * dy;
    let cx: number;
    let cy: number;
    if (lenSq === 0) {
      // zero-length edge: vertex 자체가 closest
      cx = ax;
      cy = ay;
    } else {
      const t = Math.max(0, Math.min(1, ((spx - sax) * dx + (spy - say) * dy) / lenSq));
      cx = ax * (1 - t) + bx * t;
      cy = ay * (1 - t) + by * t;
    }
    const distance = Math.hypot(cx - px, cy - py);
    if (distance < bestDistance) {
      bestDistance = distance;
      bestX = cx;
      bestY = cy;
    }
  }

  if (outScratch !== null) {
    outScratch.cx = bestX;
    outScratch.cy = bestY;
  }
  return bestDistance;
}

/**
 * polygon boundary 위에서 (px, py)와 가장 가까운 점의 squared distance를 계산한다.
 *
 * 호출자가 `pts.length >= 2`를 보장해야 한다. closed edge를 모두 순회하고, 같은 최소 거리를
 * 가진 edge가 여러 개면 더 작은 edge index의 closest를 채택한다(strict less-than 비교).
 * `outScratch`가 null이 아니면 최소 거리 edge의 closest 좌표를 그곳에 기록한다.
 * zero-length edge(repeated point)는 해당 vertex를 closest로 사용하므로 NaN을 만들지 않는다.
 *
 * @param pts polygon vertex 배열 (closed 순회)
 * @param px 비교 기준 point의 x 좌표
 * @param py 비교 기준 point의 y 좌표
 * @param outScratch closest 좌표를 받을 buffer (필요 없으면 null)
 * @returns 최소 squared distance
 */
export function polygonBoundaryClosest(
  pts: readonly XYInput[],
  px: number,
  py: number,
  outScratch: PolygonClosestScratch | null
): number {
  const distance = polygonBoundaryClosestDistance(pts, px, py, outScratch);
  return distance * distance;
}

/**
 * polygon boundary 위에서 (px, py)와 가장 가까운 점까지의 distance를 계산한다.
 *
 * `polygonBoundaryClosest`는 squared distance 반환 계약을 유지한다. distance 자체가 finite여도 제곱이
 * overflow할 수 있는 caller는 이 helper를 사용한다.
 *
 * @param pts polygon vertex 배열 (closed 순회)
 * @param px 비교 기준 point의 x 좌표
 * @param py 비교 기준 point의 y 좌표
 * @param outScratch closest 좌표를 받을 buffer (필요 없으면 null)
 * @returns 최소 distance
 */
export function polygonBoundaryDistance(
  pts: readonly XYInput[],
  px: number,
  py: number,
  outScratch: PolygonClosestScratch | null
): number {
  return polygonBoundaryClosestDistance(pts, px, py, outScratch);
}
