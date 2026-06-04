import { readPolygonPoints, shoelace2x } from '../internal/polygon';
import { readX, readY, writeXY } from '../internal/xy';
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
    writeXY(out, readX(pts[0]), readY(pts[0]));
    return true;
  }

  if (n === 2) {
    writeXY(out, (readX(pts[0]) + readX(pts[1])) / 2, (readY(pts[0]) + readY(pts[1])) / 2);
    return true;
  }

  // n >= 3: area-weighted centroid or arithmetic mean fallback
  const twoA = shoelace2x(pts);

  if (twoA === 0) {
    // arithmetic mean fallback
    let sumX = 0;
    let sumY = 0;
    for (let i = 0; i < n; i++) {
      sumX += readX(pts[i]);
      sumY += readY(pts[i]);
    }
    writeXY(out, sumX / n, sumY / n);
    return true;
  }

  // area-weighted centroid via shoelace accumulation
  let cx = 0;
  let cy = 0;
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n;
    const xi = readX(pts[i]);
    const yi = readY(pts[i]);
    const xj = readX(pts[j]);
    const yj = readY(pts[j]);
    const cross = xi * yj - xj * yi;
    cx += (xi + xj) * cross;
    cy += (yi + yj) * cross;
  }

  writeXY(out, cx / (3 * twoA), cy / (3 * twoA));
  return true;
}
