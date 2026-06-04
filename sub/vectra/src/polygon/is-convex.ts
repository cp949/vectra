import { readPolygonPoints } from '../internal/polygon';
import { readX, readY } from '../internal/xy';
import type { PolygonLike } from '../types';

/**
 * polygon이 convex이면 `true`를 반환하는 light boolean query다.
 *
 * topology output 없는 light query다. self-intersection repair, convex hull 생성, vertex
 * normalization을 하지 않는다.
 *
 * 판정 계약:
 * - structural empty(point 수 `< 3`)는 `false`.
 * - consecutive repeated point가 만드는 outgoing edge zero-length(`outX === 0 && outY === 0`)는 `false`.
 * - 인접 edge 벡터의 cross product 부호가 모든 non-zero turn에서 같으면 `true`, 섞이면 `false`.
 *   `Math.abs(cross) <= epsilon`인 collinear turn은 sign 판단에서 제외한다.
 * - collinear-only zero-area polygon(모든 turn이 collinear)은 `false`(같은 부호 non-zero turn이 없음).
 * - CW/CCW orientation은 같은 결과(모든 cross 부호가 함께 뒤집힘).
 * - self-intersecting bow-tie처럼 turn 부호가 섞이는 입력은 `false`.
 *
 * `epsilon` 기본값은 `1e-9`다. `epsilon`과 좌표 non-finite에 runtime validation을 추가하지 않는다.
 * `NaN`이나 negative `epsilon`, non-finite 좌표는 JS 비교와 산술 결과를 그대로 따른다(`NaN` epsilon이면
 * `Math.abs(cross) <= NaN`이 항상 false라 모든 turn이 sign 판단에 포함된다).
 *
 * @param polygon convex 여부를 확인할 polygon
 * @param epsilon collinear turn으로 볼 cross product 절대값 threshold (기본값 `1e-9`)
 */
export function isConvex(polygon: PolygonLike, epsilon = 1e-9): boolean {
  const pts = readPolygonPoints(polygon);
  const n = pts.length;
  if (n < 3) return false;

  let sign = 0;
  for (let i = 0; i < n; i++) {
    const prev = pts[(i - 1 + n) % n];
    const cur = pts[i];
    const next = pts[(i + 1) % n];
    const cx = readX(cur);
    const cy = readY(cur);

    // incoming edge prev -> cur, outgoing edge cur -> next
    const inX = cx - readX(prev);
    const inY = cy - readY(prev);
    const outX = readX(next) - cx;
    const outY = readY(next) - cy;

    // consecutive repeated point가 만드는 zero-length edge는 convex로 보지 않는다.
    if (outX === 0 && outY === 0) return false;

    const cross = inX * outY - inY * outX;
    if (Math.abs(cross) <= epsilon) continue;

    const s = cross > 0 ? 1 : -1;
    if (sign === 0) {
      sign = s;
    } else if (sign !== s) {
      return false;
    }
  }

  // non-zero turn이 하나도 없으면(collinear-only) convex가 아니다.
  return sign !== 0;
}
