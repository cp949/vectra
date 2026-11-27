import type { Polygon, PointWritable } from '../types/flat-shapes.internal';

/**
 * polygon의 centroid를 out에 기록하고 성공 여부를 반환한다.
 *
 * boolean primary Into 예외 함수: 성공 시 true, 실패 시 false와 out 미수정.
 * empty polygon(pointCount === 0): false 반환, out 미수정.
 * 일반 polygon: area-weighted centroid를 기록하고 true 반환.
 * zero-area degenerate polygon: arithmetic mean을 기록하고 true 반환.
 *
 * @param out centroid를 기록할 writable output (`x, y`)
 * @param polygon centroid를 계산할 polygon
 */
export function centroidInto(out: PointWritable, polygon: Polygon): boolean {
  const n = polygon.length / 2;

  if (n === 0) return false;

  if (n === 1) {
    out.x = polygon[0];
    out.y = polygon[1];
    return true;
  }

  if (n === 2) {
    out.x = (polygon[0] + polygon[2]) / 2;
    out.y = (polygon[1] + polygon[3]) / 2;
    return true;
  }

  // n >= 3: 한 번 순회로 2배 signed area, area-weighted 합, 산술 평균 합을 함께 구한다.
  const x0 = polygon[0];
  const y0 = polygon[1];
  let xi = x0;
  let yi = y0;
  let twoA = 0;
  let cx = 0;
  let cy = 0;
  let sumX = 0;
  let sumY = 0;
  for (let i = 1; i <= n; i++) {
    let xj = x0;
    let yj = y0;
    if (i < n) {
      xj = polygon[2 * i];
      yj = polygon[2 * i + 1];
    }
    const cross = xi * yj - xj * yi;
    twoA += cross;
    cx += (xi + xj) * cross;
    cy += (yi + yj) * cross;
    sumX += xi;
    sumY += yi;
    xi = xj;
    yi = yj;
  }

  if (twoA === 0) {
    out.x = sumX / n;
    out.y = sumY / n;
    return true;
  }

  out.x = cx / (3 * twoA);
  out.y = cy / (3 * twoA);
  return true;
}
