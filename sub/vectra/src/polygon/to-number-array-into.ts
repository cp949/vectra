import { readPolygonPoints } from '../internal/polygon';
import { readX, readY } from '../internal/xy';
import type { PolygonLike } from '../types';

/**
 * polygon vertex를 `[x0, y0, x1, y1, ...]` flat coordinate number 배열로 out에 기록한다.
 *
 * output-only serialization helper다. out은 먼저 clear된 뒤 좌표가 push되며, 같은 out을 반환한다.
 * point-collection 기준이다. `points.length`가 0이면 빈 배열을 반환한다.
 * 좌표 finite 여부를 검사하지 않고 그대로 기록한다(non-finite pass-through). `-0`도 canonicalize하지 않는다.
 * out은 `number[]`이라 source point array와 같은 배열일 수 없으나 기존 out contents는 clear된다.
 *
 * @param out flat 좌표를 기록할 writable number 배열
 * @param polygon vertex를 읽을 polygon
 */
export function toNumberArrayInto(out: number[], polygon: PolygonLike): number[] {
  const pts = readPolygonPoints(polygon);
  const n = pts.length;
  out.length = 0;
  for (let i = 0; i < n; i++) {
    out.push(readX(pts[i]), readY(pts[i]));
  }
  return out;
}
