import { polygonBoundaryDistance, readPolygonPoints } from '../internal/polygon';
import { readX, readY } from '../internal/xy';
import type { PolygonLike, XYInput } from '../types';

/**
 * polygon에 대한 point의 signed winding number를 반환한다.
 *
 * `containsPoint`의 even-odd containment boolean과 별도 책임인 signed/nonzero fill-rule raw scalar
 * query다. standard upward/downward horizontal-crossing 알고리즘을 따른다.
 *
 * - 양수: 입력 point 순서가 수학 좌표계(y-up) 기준 CCW이고 point가 내부면 우세(예: 단순 CCW면 `1`).
 * - 음수: 입력 point 순서가 y-up 기준 CW이고 point가 내부면 우세(예: 단순 CW면 `-1`).
 * - `0`: 외부이거나 winding이 상쇄.
 * - empty polygon(point 수 `< 3`)은 `0`.
 *
 * boundary 정책: edge까지 거리가 `epsilon` 이하이면 `0`을 반환한다(`containsPoint`와 같은
 * `polygonBoundaryDistance` 거리 threshold 재사용). `containsPoint`는 boundary를 `true`로,
 * `polygonWindingNumber`는 boundary를 `0`으로 다룬다(서로 다른 책임). `epsilon` 기본값은 `0`이다.
 *
 * `epsilon`과 좌표 non-finite에 runtime validation을 추가하지 않는다. `NaN`이나 negative `epsilon`,
 * non-finite 좌표는 JS 비교와 산술 결과를 그대로 따른다(`NaN` epsilon이면 boundary 비교가 항상 false라
 * boundary로 빠지지 않는다). self-intersecting polygon은 repair하지 않고 알고리즘의 deterministic
 * result를 그대로 반환한다.
 *
 * @param polygon winding을 계산할 polygon
 * @param point 판정 기준 point
 * @param epsilon boundary proximity threshold (기본값 `0`)
 */
export function polygonWindingNumber(polygon: PolygonLike, point: XYInput, epsilon = 0): number {
  const pts = readPolygonPoints(polygon);
  const n = pts.length;
  if (n < 3) return 0;

  const px = readX(point);
  const py = readY(point);

  // boundary proximity는 containsPoint와 같은 거리 threshold로 처리한다. edge까지 거리가 epsilon
  // 이하이면 winding 0이다.
  if (polygonBoundaryDistance(pts, px, py, null) <= epsilon) return 0;

  // standard horizontal-crossing winding: upward crossing이며 point가 왼쪽이면 +1,
  // downward crossing이며 point가 오른쪽이면 -1.
  let winding = 0;
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n;
    const ax = readX(pts[i]);
    const ay = readY(pts[i]);
    const bx = readX(pts[j]);
    const by = readY(pts[j]);
    if (ay <= py) {
      if (by > py) {
        const cross = (bx - ax) * (py - ay) - (by - ay) * (px - ax);
        if (cross > 0) winding++;
      }
    } else if (by <= py) {
      const cross = (bx - ax) * (py - ay) - (by - ay) * (px - ax);
      if (cross < 0) winding--;
    }
  }
  return winding;
}
