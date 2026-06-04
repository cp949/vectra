import { polygonContainsPoint } from '../internal/polygon';
import { readTriangleRawCoords } from '../internal/triangle';
import { readX, readY, writeXY } from '../internal/xy';
import type { TriangleLike, XYInput, XYWritable } from '../types';
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
 * aliasing: triangle 좌표와 point 좌표를 local에 먼저 읽으므로 out이 triangle.a / triangle.b /
 * triangle.c / point와 같은 storage여도 안전하다.
 *
 * @param out closest point를 기록할 writable output
 * @param triangle 대상 triangle
 * @param point closest point를 측정할 기준 point
 */
export function closestPointInto<Out extends XYWritable>(out: Out, triangle: TriangleLike, point: XYInput): Out {
  const { ax, ay, bx, by, cx, cy } = readTriangleRawCoords(triangle);
  const px = readX(point);
  const py = readY(point);

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
      return writeXY(out, px, py);
    }
  }

  const best = triangleEdgeClosest(ax, ay, bx, by, cx, cy, px, py);
  return writeXY(out, best.x, best.y);
}
