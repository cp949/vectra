import type { Polyline, PointWritable } from '../types/flat-shapes.internal';
import { pointDist } from './polyline-distance-primitive.internal';

/**
 * polyline의 length offset target에서 보간한 point를 out에 기록한다.
 *
 * 호출자가 points.length >= 2, totalLen > 0, target ∈ [0, totalLen]를 보장한다.
 * 마지막 segment까지 누적 길이가 target에 도달하지 못해도 마지막 segment 위에서 보간한다.
 *
 * @param out 보간한 point를 기록할 writable output
 * @param points sample할 polyline vertex 목록
 * @param target polyline 시작점부터의 length offset
 */
export function polylineSampleAtLengthInto(out: PointWritable, points: Polyline, target: number): void {
  const n = points.length;
  let acc = 0;
  for (let i = 1; i < n; i++) {
    const ax = points[i - 1].x;
    const ay = points[i - 1].y;
    const bx = points[i].x;
    const by = points[i].y;
    const segLen = pointDist(ax, ay, bx, by);
    // 마지막 segment이거나 target에 도달하면 이 segment 위에서 보간
    if (i === n - 1 || acc + segLen >= target) {
      if (segLen === 0) {
        out.x = ax;
        out.y = ay;
      } else {
        const localT = Math.max(0, Math.min(1, (target - acc) / segLen));
        out.x = ax + localT * (bx - ax);
        out.y = ay + localT * (by - ay);
      }
      return;
    }
    acc += segLen;
  }
}
