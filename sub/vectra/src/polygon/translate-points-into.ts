import { readPolygonPoints } from '../internal/polygon';
import { readX, readY } from '../internal/xy';
import type { PolygonLike, XYInput, XYObjectWritable } from '../types';

/**
 * polygon의 모든 point에 offset을 더해 outPoints에 새 point object로 기록한다.
 *
 * outPoints는 먼저 clear된 뒤 결과 point가 push되며, 같은 outPoints를 반환한다.
 * 입력 point array와 outPoints가 같은 배열이어도 안전하다.
 *
 * @param outPoints 변환된 point object를 기록할 writable output array
 * @param polygon point를 읽을 polygon
 * @param offset 각 point에 더할 offset
 */
export function translatePointsInto(
  outPoints: XYObjectWritable[],
  polygon: PolygonLike,
  offset: XYInput
): XYObjectWritable[] {
  const pts = readPolygonPoints(polygon);
  const n = pts.length;
  const dx = readX(offset);
  const dy = readY(offset);
  // input/output array aliasing에 대비해 clear 전에 좌표를 snapshot한다.
  const xs: number[] = new Array(n);
  const ys: number[] = new Array(n);
  for (let i = 0; i < n; i++) {
    xs[i] = readX(pts[i]);
    ys[i] = readY(pts[i]);
  }
  outPoints.length = 0;
  for (let i = 0; i < n; i++) {
    outPoints.push({ x: xs[i] + dx, y: ys[i] + dy });
  }
  return outPoints;
}
