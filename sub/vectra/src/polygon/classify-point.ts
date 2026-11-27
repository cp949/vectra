import type { Polygon, Point } from '../types/flat-shapes.internal';
import { polygonBoundaryDistance } from '../internal/polygon';
import type { PointContainment } from '../types';

/**
 * polygon 내 point 위치를 `'inside'`, `'boundary'`, `'outside'` 중 하나로 반환한다.
 *
 * boundary 판정: 모든 edge에서 point까지의 최근접 거리가 epsilon 이하이면 `'boundary'`.
 * interior 판정: ray casting. boundary가 아니고 ray casting이 내부이면 `'inside'`.
 * empty polygon(pointCount < 3): `'outside'`.
 * epsilon < 0: RangeError.
 * self-intersecting polygon은 repair하지 않고 ray casting 결과를 그대로 사용한다.
 *
 * @param polygon 위치를 분류할 polygon
 * @param point 분류할 point
 * @param epsilon boundary proximity threshold (기본값 0)
 */
export function classifyPoint(polygon: Polygon, point: Point, epsilon = 0): PointContainment {
  if (epsilon < 0) throw new RangeError('epsilon must be >= 0');

  const n = polygon.length / 2;
  if (n < 3) return 'outside';

  const px = point.x;
  const py = point.y;
  // boundary check: edge 위 최근접 점까지의 거리가 epsilon 이하
  if (polygonBoundaryDistance(polygon, px, py, null) <= epsilon) return 'boundary';

  // ray casting (interior check)
  // +x 방향 반직선을 쏘고 crossing 수가 홀수이면 내부
  let inside = false;
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n;
    const ay = polygon[2 * i + 1];
    const by = polygon[2 * j + 1];
    // lower-left rule: y 범위에서 py를 포함하고, 교점이 px보다 오른쪽이면 crossing
    if ((ay <= py && by > py) || (by <= py && ay > py)) {
      const ax = polygon[2 * i];
      const bx = polygon[2 * j];
      const t = (py - ay) / (by - ay);
      const xCross = ax * (1 - t) + bx * t;
      if (xCross > px) inside = !inside;
    }
  }

  return inside ? 'inside' : 'outside';
}
