import { polygonContainsPoint } from '../internal/polygon';
import type { Triangle, Point, PointWritable } from '../types/flat-shapes.internal';
import { triangleEdgeClosest } from './closest-point.internal';

/**
 * triangle 위의 closest point를 out에 기록하고 out을 반환한다.
 *
 * non-degenerate triangle 내부 또는 boundary point는 input point 좌표를 그대로 기록한다.
 * 외부 point는 세 edge segment AB, BC, CA의 clamped closest point 중 거리 제곱이 가장 작은
 * 점을 기록한다. 동거리 tie-break는 strict `<`로 AB → BC → CA 순서를 유지한다.
 *
 * degenerate triangle(collinear, 세 vertex가 같은 점 포함)은 closed area로 보지 않고 세 segment
 * AB, BC, CA의 최단점으로 환원한다. 세 vertex가 모두 같으면 그 vertex를 기록한다.
 *
 * non-finite 좌표는 검증 없이 JS 산술 결과를 그대로 기록한다. 모든 후보 거리 비교가 NaN이면
 * 첫 후보 AB 계산 결과를 기록한다. 항상 실패하지 않고 out을 반환한다.
 *
 * triangle 좌표와 point 좌표를 먼저 읽은 뒤 out에 기록한다.
 *
 * @param out closest point를 기록할 점 객체
 * @param triangle 대상 triangle
 * @param point closest point를 측정할 기준 point
 */
export function closestPointInto<Out extends PointWritable>(out: Out, triangle: Triangle, point: Point): Out {
  const { x1: ax, y1: ay, x2: bx, y2: by, x3: cx, y3: cy } = triangle;
  const px = point.x;
  const py = point.y;

  // non-degenerate triangle 내부/boundary는 input point 좌표를 그대로 기록한다.
  // degenerate(signed area 2x === 0)는 closed area로 해석하지 않고 edge 환원으로 떨어진다.
  const area2x = (bx - ax) * (cy - ay) - (by - ay) * (cx - ax);
  if (area2x !== 0) {
    const inside = polygonContainsPoint(
      [
        { x: ax, y: ay },
        { x: bx, y: by },
        { x: cx, y: cy },
      ],
      px,
      py,
      0
    );
    if (inside) {
      out.x = px;
      out.y = py;
      return out;
    }
  }

  const best = triangleEdgeClosest(ax, ay, bx, by, cx, cy, px, py);
  out.x = best.x;
  out.y = best.y;
  return out;
}
