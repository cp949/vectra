import type { XYInput } from '../types';
import { readX, readY } from './xy';

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
