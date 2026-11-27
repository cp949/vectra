import type { Circle, Point, PointWritable } from '../types/flat-shapes.internal';
import { hypot2 } from '../internal/numeric';

/**
 * circle 표면에서 point에 가장 가까운 점을 out에 기록하고 out을 반환한다.
 *
 * empty circle은 center를 기록한다. point가 center와 같으면 angle 0 위치인 (cx + r, cy)를 기록한다.
 * input과 out이 같은 object여도 안전하다.
 *
 * @param out 결과를 기록할 점 객체
 * @param circle closest point를 계산할 circle
 * @param point circle 표면에 투영할 point
 */
export function closestPointInto<Out extends PointWritable>(out: Out, circle: Circle, point: Point): Out {
  // aliasing 안전 - 입력을 먼저 읽은 후 기록한다
  const cx = circle.cx;
  const cy = circle.cy;
  const r = circle.r;
  const px = point.x;
  const py = point.y;

  if (r <= 0) {
    out.x = cx;
    out.y = cy;
    return out;
  }

  const dx = px - cx;
  const dy = py - cy;
  const dist = hypot2(dx, dy);

  // 중심과 일치하면 각도 0의 점을 기록한다.
  if (dist === 0) {
    out.x = cx + r;
    out.y = cy;
    return out;
  }

  out.x = cx + (dx / dist) * r;
  out.y = cy + (dy / dist) * r;
  return out;
}
