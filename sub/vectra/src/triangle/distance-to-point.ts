import { polygonContainsPoint } from '../internal/polygon';
import { readTriangleRawCoords } from '../internal/triangle';
import { readX, readY } from '../internal/xy';
import type { TriangleLike, XYInput } from '../types';
import { triangleEdgeClosest } from './closest-point.internal';

/**
 * triangle과 point 사이 unsigned 최단 거리를 반환한다.
 *
 * non-degenerate triangle 내부 또는 boundary point는 0을 반환한다. 외부 point는 세 edge segment
 * AB, BC, CA의 clamped closest point 중 최소 unsigned 거리를 반환한다.
 *
 * degenerate triangle(collinear, 세 vertex가 같은 점 포함)은 closed area로 보지 않고 세 segment
 * AB, BC, CA 중 최소 unsigned 거리로 환원한다. 세 vertex가 모두 같으면 그 vertex와 point의
 * Euclidean 거리를 반환한다.
 *
 * non-finite 좌표는 검증 없이 JS 산술 결과를 따른다. 비교 가능한 후보가 없으면 NaN을 반환한다.
 *
 * @param triangle 거리를 측정할 triangle
 * @param point triangle까지의 거리를 측정할 point
 */
export function distanceToPoint(triangle: TriangleLike, point: XYInput): number {
  const { ax, ay, bx, by, cx, cy } = readTriangleRawCoords(triangle);
  const px = readX(point);
  const py = readY(point);

  // non-degenerate 내부/boundary는 0. degenerate는 segment 환원으로 떨어진다.
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
    if (inside) return 0;
  }

  const best = triangleEdgeClosest(ax, ay, bx, by, cx, cy, px, py);
  return Math.sqrt(best.distSq);
}
