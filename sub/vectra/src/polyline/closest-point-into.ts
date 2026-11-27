import { segClampedT } from '../internal/polyline';
import type { Polyline, Point, PointWritable } from '../types/flat-shapes.internal';

/**
 * polyline 위에서 point에 가장 가까운 점을 out에 기록한다.
 *
 * empty polyline에서는 false를 반환하고 out을 수정하지 않는다.
 * single-point polyline 또는 모든 segment length가 0인 repeated-point polyline은 첫 point를 기록한다.
 * 각 segment projection parameter는 [0, 1]로 clamp되며, 동거리 closest segment는 앞쪽 segment를 우선한다.
 * out이 point 또는 polyline point와 alias되어도 안전하다.
 *
 * @param out closest point를 기록할 writable output (`x`, `y`)
 * @param polyline closest point를 찾을 polyline
 * @param point polyline에 투영할 query point
 */
export function closestPointInto(out: PointWritable, polyline: Polyline, point: Point): boolean {
  const points = polyline;
  if (points.length === 0) return false;

  // query point aliasing에 대비해 out 기록 전에 좌표를 먼저 읽는다.
  const qx = point.x;
  const qy = point.y;

  if (points.length === 1) {
    const { x, y } = points[0];
    out.x = x;
    out.y = y;
    return true;
  }

  let bestDistSq = Infinity;
  let bestCx = 0;
  let bestCy = 0;

  for (let i = 1; i < points.length; i++) {
    const ax = points[i - 1].x;
    const ay = points[i - 1].y;
    const bx = points[i].x;
    const by = points[i].y;
    const t = segClampedT(ax, ay, bx, by, qx, qy);
    const cx = ax + t * (bx - ax);
    const cy = ay + t * (by - ay);
    const ex = cx - qx;
    const ey = cy - qy;
    const dSq = ex * ex + ey * ey;

    // strict <로 동거리일 때 앞쪽 segment를 유지한다.
    if (dSq < bestDistSq) {
      bestDistSq = dSq;
      bestCx = cx;
      bestCy = cy;
    }
  }

  out.x = bestCx;
  out.y = bestCy;
  return true;
}
