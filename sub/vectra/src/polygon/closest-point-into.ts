import { polygonBoundaryClosest, readPolygonPoints } from '../internal/polygon';
import { readX, readY, writeXY } from '../internal/xy';
import type { PolygonLike, XYInput, XYWritable } from '../types';

/**
 * polygon boundary에서 point와 가장 가까운 점을 out에 기록하고 성공 여부를 반환한다.
 *
 * boolean primary Into 예외 함수: 성공 시 true, 실패 시 false와 out 미수정.
 * empty polygon(pointCount === 0): false 반환, out 미수정.
 * single-point polygon: 해당 point를 기록하고 true 반환.
 * two-point polygon: segment boundary로 closest point를 계산한다.
 * repeated-point edge(zero-length segment)는 해당 point를 closest로 반환한다.
 * 여러 edge가 동일 최소 거리를 가지면 가장 작은 edge index의 closest를 채택한다.
 *
 * @param out closest point를 기록할 writable output
 * @param polygon closest point를 계산할 polygon
 * @param point 가장 가까운 점을 찾을 기준 point
 */
export function closestPointInto(out: XYWritable, polygon: PolygonLike, point: XYInput): boolean {
  const pts = readPolygonPoints(polygon);
  const n = pts.length;
  if (n === 0) return false;

  // single-point: edge가 없으므로 해당 점을 직접 기록한다
  if (n === 1) {
    writeXY(out, readX(pts[0]), readY(pts[0]));
    return true;
  }

  const scratch = { cx: 0, cy: 0 };
  polygonBoundaryClosest(pts, readX(point), readY(point), scratch);
  writeXY(out, scratch.cx, scratch.cy);
  return true;
}
