/**
 * triangle closest-point raw kernel.
 *
 * scalar 입출력 전용 internal helper. validation 없음. 호출자가 유효한 좌표를 보장한다.
 * triangle leaf 간 공개 함수 cross-import를 피하기 위해 segment closest-point와 triangle
 * 환원 정책을 한 곳에서 공유한다.
 */

import { segmentClosestPointXY } from '../internal/segment';

/** triangle 환원 결과: closest point 좌표와 거리 제곱. */
export interface TriangleClosestResult {
  /** closest point x */
  x: number;

  /** closest point y */
  y: number;

  /** point ↔ closest point 거리 제곱. 모든 후보 거리가 NaN이면 NaN. */
  distSq: number;
}

/**
 * triangle 세 edge AB / BC / CA의 clamped closest point 중 거리 제곱이 가장 작은 후보를 반환한다.
 *
 * 동거리 tie-break는 strict `<` 비교로 AB → BC → CA 순서. 동거리는 AB를 유지한다.
 * non-finite 좌표는 검증 없이 pass through한다. NaN 거리는 strict `<` 비교에서 항상 false이므로
 * "AB 거리가 NaN이면 BC/CA가 finite여도 AB 후보가 유지된다". 마찬가지로 BC가 NaN이고 CA가
 * finite이면 BC를 건너뛰고 CA가 AB와 직접 비교된다.
 *
 * @param ax triangle vertex A x
 * @param ay triangle vertex A y
 * @param bx triangle vertex B x
 * @param by triangle vertex B y
 * @param cx triangle vertex C x
 * @param cy triangle vertex C y
 * @param px 기준 point x
 * @param py 기준 point y
 */
export function triangleEdgeClosest(
  ax: number,
  ay: number,
  bx: number,
  by: number,
  cx: number,
  cy: number,
  px: number,
  py: number
): TriangleClosestResult {
  const ab = segmentClosestPointXY(ax, ay, bx, by, px, py);
  const abDx = ab.x - px;
  const abDy = ab.y - py;
  const abDistSq = abDx * abDx + abDy * abDy;

  const bc = segmentClosestPointXY(bx, by, cx, cy, px, py);
  const bcDx = bc.x - px;
  const bcDy = bc.y - py;
  const bcDistSq = bcDx * bcDx + bcDy * bcDy;

  const ca = segmentClosestPointXY(cx, cy, ax, ay, px, py);
  const caDx = ca.x - px;
  const caDy = ca.y - py;
  const caDistSq = caDx * caDx + caDy * caDy;

  // strict <로 AB → BC → CA 순서 유지. 동거리/NaN 비교는 false라 앞 후보가 유지된다.
  let bestX = ab.x;
  let bestY = ab.y;
  let bestDistSq = abDistSq;
  if (bcDistSq < bestDistSq) {
    bestX = bc.x;
    bestY = bc.y;
    bestDistSq = bcDistSq;
  }
  if (caDistSq < bestDistSq) {
    bestX = ca.x;
    bestY = ca.y;
    bestDistSq = caDistSq;
  }

  return { x: bestX, y: bestY, distSq: bestDistSq };
}
