import { readPolygonPoints } from '../internal/polygon';
import { areaX, areaY } from '../internal/polygon-area-read.internal';
import { writeXY } from '../internal/xy';
import type { PolygonLike, XYWritable } from '../types';

/**
 * polygon의 centroid를 out에 기록하고 성공 여부를 반환한다.
 *
 * boolean primary Into 예외 함수: 성공 시 true, 실패 시 false와 out 미수정.
 * empty polygon(pointCount === 0): false 반환, out 미수정.
 * 일반 polygon: area-weighted centroid를 기록하고 true 반환.
 * zero-area degenerate polygon: arithmetic mean을 기록하고 true 반환.
 *
 * @param out centroid를 기록할 writable output
 * @param polygon centroid를 계산할 polygon
 */
export function centroidInto(out: XYWritable, polygon: PolygonLike): boolean {
  const pts = readPolygonPoints(polygon);
  const n = pts.length;

  if (n === 0) return false;

  if (n === 1) {
    writeXY(out, areaX(pts[0]), areaY(pts[0]));
    return true;
  }

  if (n === 2) {
    writeXY(out, (areaX(pts[0]) + areaX(pts[1])) / 2, (areaY(pts[0]) + areaY(pts[1])) / 2);
    return true;
  }

  // n >= 3: 한 번 순회로 2배 signed area, area-weighted 합, 산술 평균 합을 함께 구한다.
  const first = pts[0];
  const x0 = areaX(first);
  const y0 = areaY(first);
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
      const p = pts[i];
      xj = areaX(p);
      yj = areaY(p);
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
    writeXY(out, sumX / n, sumY / n);
    return true;
  }

  writeXY(out, cx / (3 * twoA), cy / (3 * twoA));
  return true;
}
