/**
 * ellipse와 axis-aligned box edge의 arc crossing 검사 core.
 *
 * 여러 leaf module에서 공유하는 quadratic helper다.
 * 호출자는 radiusX > 0, radiusY > 0을 보장해야 한다.
 */

/**
 * line segment (x0,y0)→(x1,y1)이 ellipse arc를 crossing하는지 판정한다.
 *
 * ellipse 좌표계 정규화로 단위원 교차 문제로 환원한다.
 *   U0 = (x0-cx)/rx, V0 = (y0-cy)/ry
 *   DU = (x1-x0)/rx, DV = (y1-y0)/ry
 *   quadratic: (DU²+DV²)t² + 2(U0·DU+V0·DV)t + (U0²+V0²-1) = 0
 * discriminant ≥ 0이고 t ∈ [0,1] 범위 root가 존재하면 true.
 * closed boundary: disc = 0(접선) 포함.
 *
 * a === 0 (점 segment, x0===x1 && y0===y1)인 경우 quadratic을 풀 수 없으므로
 * 점 판정으로 처리한다: c ≤ 0이면 점이 ellipse 위 또는 내부에 위치하므로 true.
 *
 * @param x0 segment 시작점 x
 * @param y0 segment 시작점 y
 * @param x1 segment 끝점 x
 * @param y1 segment 끝점 y
 * @param cx ellipse center x
 * @param cy ellipse center y
 * @param rx ellipse x반지름 (양수 보장 필요)
 * @param ry ellipse y반지름 (양수 보장 필요)
 */
export function segmentCrossesEllipse(
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  cx: number,
  cy: number,
  rx: number,
  ry: number
): boolean {
  // 정규화된 segment 방향 벡터 및 시작점
  const u0 = (x0 - cx) / rx;
  const v0 = (y0 - cy) / ry;
  const du = (x1 - x0) / rx;
  const dv = (y1 - y0) / ry;

  // quadratic at² + bt + c = 0
  const a = du * du + dv * dv;
  const b = 2 * (u0 * du + v0 * dv);
  const c = u0 * u0 + v0 * v0 - 1;

  // 점 segment (x0===x1, y0===y1): a === 0이면 division by zero 방지
  // c <= 0 → 점이 ellipse 위 또는 내부
  if (a === 0) return c <= 0;

  const disc = b * b - 4 * a * c;

  // discriminant < 0 → 교점 없음
  if (disc < 0) return false;

  const sqrtDisc = Math.sqrt(disc);

  // t ∈ [0,1] 범위의 root 존재 여부 확인
  const t1 = (-b - sqrtDisc) / (2 * a);
  if (t1 >= 0 && t1 <= 1) return true;

  const t2 = (-b + sqrtDisc) / (2 * a);
  if (t2 >= 0 && t2 <= 1) return true;

  return false;
}

/**
 * axis-aligned box의 4 edge가 ellipse arc를 crossing하는지 판정한다.
 *
 * box edge 4개를 각각 segment로 검사한다. 하나라도 crossing이면 true.
 *
 * @param minX box 왼쪽 경계 x
 * @param minY box 위쪽 경계 y
 * @param maxX box 오른쪽 경계 x
 * @param maxY box 아래쪽 경계 y
 * @param cx ellipse center x
 * @param cy ellipse center y
 * @param rx ellipse x반지름 (양수 보장 필요)
 * @param ry ellipse y반지름 (양수 보장 필요)
 */
export function boxEdgesCrossEllipse(
  minX: number,
  minY: number,
  maxX: number,
  maxY: number,
  cx: number,
  cy: number,
  rx: number,
  ry: number
): boolean {
  // 왼쪽 edge: (minX, minY) → (minX, maxY)
  if (segmentCrossesEllipse(minX, minY, minX, maxY, cx, cy, rx, ry)) return true;
  // 오른쪽 edge: (maxX, minY) → (maxX, maxY)
  if (segmentCrossesEllipse(maxX, minY, maxX, maxY, cx, cy, rx, ry)) return true;
  // 위쪽 edge: (minX, minY) → (maxX, minY)
  if (segmentCrossesEllipse(minX, minY, maxX, minY, cx, cy, rx, ry)) return true;
  // 아래쪽 edge: (minX, maxY) → (maxX, maxY)
  if (segmentCrossesEllipse(minX, maxY, maxX, maxY, cx, cy, rx, ry)) return true;

  return false;
}
