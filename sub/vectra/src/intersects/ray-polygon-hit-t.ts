import { raySegmentHitTXY } from '../internal/ray-hit-t.internal';
import type { Polygon, Ray } from '../types/flat-shapes.internal';

/**
 * ray가 polygon boundary와 처음 만나는 ray parameter `t`를 반환한다.
 *
 * `origin + t * direction`이 polygon edge 위의 점이 되는 `t ≥ tMin` 중 가장 작은 값이다.
 * 점이 아니라 `t`를 반환하므로 여러 물체 중 가장 가까운 것을 고르는 비교에 그대로 쓴다.
 * - `t`는 `{ dx, dy }` 길이 단위다. direction을 정규화하지 않으므로 거리는 `t * |direction|`이다.
 * - hit이 없으면 `Infinity`를 반환한다. `t < best` 비교와 `Math.min`에 그대로 쓸 수 있다.
 * - edge는 `raySegmentHitT`와 같은 규칙으로 판정한다. 끝점 접촉은 hit이고, 평행·collinear edge는 건너뛴다.
 * - ray가 edge를 따라 달리면 그 edge 양 끝의 이웃 edge가 vertex hit을 만든다.
 * - origin이 polygon 안이면 `tMin` 이상인 boundary 교점 중 가장 작은 값이다. 보통 exit이다.
 * - 3점 미만 polygon과 zero direction은 `Infinity`다.
 * - `tMin`은 inclusive다. `t === tMin`인 교점도 hit이다.
 *
 * 반사·굴절 직후 출발 면과 다시 만나는 `t ≈ 0` 교점은 `tMin`에 작은 양수를 주어 거른다.
 * `closestRayPolygonIntersectionInto`는 변 위에서 떠난 ray에 `t = 0`을 돌려주지만 이 함수는 `tMin`으로 거른다.
 * 열린 ring은 마지막 점과 첫 점 사이 edge로 닫는다. 점 하나를 두 번 반복해도 zero-length edge는 건너뛴다.
 * non-finite 좌표를 가진 edge는 hit 없음으로 처리한다.
 *
 * @param ray { ox, oy }에서 { dx, dy } 방향으로 뻗는 반직선.
 * @param polygon 교점을 구할 polygon
 * @param tMin 허용하는 가장 작은 `t`. 생략하면 `0`이다.
 * @param epsilon edge 평행 판정 임계값. 생략하면 `sin θ <= 1e-9`(scale 불변)이다. 명시하면 `|cross| <= epsilon` 절대 비교다.
 */
export function rayPolygonHitT(ray: Ray, polygon: Polygon, tMin = 0, epsilon?: number): number {
  const n = polygon.length;
  if (n < 6) return Infinity;

  // 마지막 점에서 첫 점으로 닫는 edge부터 시작해 각 점을 한 번만 읽는다.
  let ax = polygon[n - 2];
  let ay = polygon[n - 1];
  let best = Infinity;
  for (let i = 0; i < n; i += 2) {
    const bx = polygon[i];
    const by = polygon[i + 1];
    const t = raySegmentHitTXY(ray.ox, ray.oy, ray.dx, ray.dy, ax, ay, bx, by, tMin, epsilon);
    if (t < best) best = t;
    ax = bx;
    ay = by;
  }
  return best;
}
