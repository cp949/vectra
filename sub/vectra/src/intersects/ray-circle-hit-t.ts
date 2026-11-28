import { DEFAULT_EPSILON } from '../internal/numeric';
import { rayEllipseHitTXY } from '../internal/ray-hit-t.internal';
import type { Circle, Ray } from '../types/flat-shapes.internal';

/**
 * ray가 circle circumference와 처음 만나는 ray parameter `t`를 반환한다.
 *
 * `(ox + t·dx, oy + t·dy)`가 circumference 위의 점이 되는 `t ≥ tMin` 중 가장 작은 값이다.
 * 점이 아니라 `t`를 반환하므로 여러 물체 중 가장 가까운 것을 고르는 비교에 그대로 쓴다.
 * - `t`는 `(dx, dy)` 길이 단위다. `(dx, dy)`를 정규화하지 않으므로 거리는 `t * |(dx, dy)|`이다.
 * - hit이 없으면 `Infinity`를 반환한다. `t < best` 비교와 `Math.min`에 그대로 쓸 수 있다.
 * - 시작점 (ox, oy)가 circle 안이면 두 root 중 `tMin` 이상인 exit 교점의 `t`를 반환한다.
 * - tangent는 접점의 `t`를 반환한다. 접점 `t`가 `tMin`보다 작으면 `Infinity`다.
 * - circle 뒤쪽(`t < tMin`)에만 교점이 있으면 `Infinity`다.
 * - `dx = dy = 0`인 ray와 empty circle(r ≤ 0)은 `Infinity`다.
 * - `tMin`은 inclusive다. `t === tMin`인 교점도 hit이다.
 *
 * 반사·굴절 직후 출발 면과 다시 만나는 `t ≈ 0` 교점은 `tMin`에 작은 양수를 주어 거른다.
 * `tMin`도 `(dx, dy)` 길이 단위다.
 * `rayCircleIntersectionsInto`와 같은 방정식을 푼다. `tMin`이 `0`이면 `(ox + t·dx, oy + t·dy)`가 그 함수가 첫 번째로 기록하는 교점과 같다.
 * non-finite 입력은 검증하지 않는다. 계산이 NaN이 되면 hit 없음(`Infinity`)으로 처리한다.
 *
 * @param ray (ox, oy)에서 (dx, dy) 방향으로 뻗는 반직선.
 * @param circle 교점을 구할 circle
 * @param tMin 허용하는 가장 작은 `t`. 생략하면 `0`이다.
 * @param epsilon discriminant tangent 판정 임계값. 생략하면 `1e-9`다.
 */
export function rayCircleHitT(ray: Ray, circle: Circle, tMin = 0, epsilon = DEFAULT_EPSILON): number {
  const radius = circle.r;
  return rayEllipseHitTXY(ray.ox, ray.oy, ray.dx, ray.dy, circle.cx, circle.cy, radius, radius, tMin, epsilon);
}
