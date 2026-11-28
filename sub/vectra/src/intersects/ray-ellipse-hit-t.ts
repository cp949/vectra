import { DEFAULT_EPSILON } from '../internal/numeric';
import { rayEllipseHitTXY } from '../internal/ray-hit-t.internal';
import type { Ellipse, Ray } from '../types/flat-shapes.internal';

/**
 * ray가 ellipse circumference와 처음 만나는 ray parameter `t`를 반환한다.
 *
 * `(ox + t·dx, oy + t·dy)`가 circumference 위의 점이 되는 `t ≥ tMin` 중 가장 작은 값이다.
 * 의미와 `Infinity` 규칙은 `rayCircleHitT`와 같다.
 * - `t`는 `(dx, dy)` 길이 단위다. `(dx, dy)`를 정규화하지 않는다.
 * - hit이 없으면 `Infinity`를 반환한다.
 * - 시작점 (ox, oy)가 ellipse 안이면 exit 교점의 `t`를 반환한다.
 * - tangent는 접점의 `t`를 반환한다. 접점 `t`가 `tMin`보다 작으면 `Infinity`다.
 * - `dx = dy = 0`인 ray와 empty ellipse(rx ≤ 0 또는 ry ≤ 0)는 `Infinity`다.
 * - `tMin`은 inclusive다.
 *
 * axis-aligned ellipse만 받는다. 회전은 지원하지 않는다.
 * `rayEllipseIntersectionsInto`와 같은 방정식을 푼다. `tMin`이 `0`이면 `(ox + t·dx, oy + t·dy)`가 그 함수가 첫 번째로 기록하는 교점과 같다.
 * non-finite 입력은 검증하지 않는다. 계산이 NaN이 되면 hit 없음(`Infinity`)으로 처리한다.
 *
 * @param ray (ox, oy)에서 (dx, dy) 방향으로 뻗는 반직선.
 * @param ellipse 교점을 구할 ellipse
 * @param tMin 허용하는 가장 작은 `t`. 생략하면 `0`이다.
 * @param epsilon discriminant tangent 판정 임계값. 생략하면 `1e-9`다.
 */
export function rayEllipseHitT(ray: Ray, ellipse: Ellipse, tMin = 0, epsilon = DEFAULT_EPSILON): number {
  return rayEllipseHitTXY(
    ray.ox,
    ray.oy,
    ray.dx,
    ray.dy,
    ellipse.cx,
    ellipse.cy,
    ellipse.rx,
    ellipse.ry,
    tMin,
    epsilon
  );
}
