import { polygonBoundaryDistance, readPolygonPoints } from '../internal/polygon';
import { readX, readY } from '../internal/xy';
import type { PointContainment, PolygonLike, XYInput } from '../types';

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
export function classifyPoint(polygon: PolygonLike, point: XYInput, epsilon = 0): PointContainment {
  if (epsilon < 0) throw new RangeError('epsilon must be >= 0');

  const pts = readPolygonPoints(polygon);
  const n = pts.length;
  if (n < 3) return 'outside';

  const px = readX(point);
  const py = readY(point);
  // boundary check: edge 위 최근접 점까지의 거리가 epsilon 이하
  if (polygonBoundaryDistance(pts, px, py, null) <= epsilon) return 'boundary';

  // ray casting (interior check)
  // +x 방향 반직선을 쏘고 crossing 수가 홀수이면 내부
  let inside = false;
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n;
    const ay = readY(pts[i]);
    const by = readY(pts[j]);
    // lower-left rule: y 범위에서 py를 포함하고, 교점이 px보다 오른쪽이면 crossing
    if ((ay <= py && by > py) || (by <= py && ay > py)) {
      const ax = readX(pts[i]);
      const bx = readX(pts[j]);
      const t = (py - ay) / (by - ay);
      const xCross = ax * (1 - t) + bx * t;
      if (xCross > px) inside = !inside;
    }
  }

  return inside ? 'inside' : 'outside';
}
