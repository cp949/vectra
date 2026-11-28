import { rayBoxHitTXY } from '../internal/ray-hit-t.internal';
import type { Bounds, Ray } from '../types/flat-shapes.internal';

/**
 * ray가 bounds boundary와 처음 만나는 ray parameter `t`를 반환한다.
 *
 * `(ox + t·dx, oy + t·dy)`가 bounds boundary 위의 점이 되는 `t ≥ tMin` 중 가장 작은 값이다.
 * 의미와 `Infinity` 규칙은 `rayRectHitT`와 같다. empty 기준만 다르다.
 * - `t`는 `(dx, dy)` 길이 단위다. `(dx, dy)`를 정규화하지 않는다.
 * - hit이 없으면 `Infinity`를 반환한다.
 * - 시작점 (ox, oy)가 bounds 밖이면 진입 교점의 `t`다. 안이면 exit 교점의 `t`다.
 * - 모서리·변 접촉은 hit이다. bounds는 closed다.
 * - inverted bounds(max < min)와 `dx = dy = 0`인 ray는 `Infinity`다.
 * - zero-extent bounds(점·선)는 유효하다. ray가 그 점이나 선을 지나면 hit이다.
 * - `tMin`은 inclusive다. `t === tMin`인 교점도 hit이다.
 *
 * `tMin`이 `0`이면 `(ox + t·dx, oy + t·dy)`가 `rayBoundsIntersectionsInto`가 첫 번째로 기록하는 교점과 같다.
 * non-finite 입력은 검증하지 않는다. 계산이 NaN이 되면 hit 없음(`Infinity`)으로 처리한다.
 *
 * @param ray (ox, oy)에서 (dx, dy) 방향으로 뻗는 반직선.
 * @param bounds 교점을 구할 bounds (axis-aligned)
 * @param tMin 허용하는 가장 작은 `t`. 생략하면 `0`이다.
 */
export function rayBoundsHitT(ray: Ray, bounds: Bounds, tMin = 0): number {
  const x0 = bounds.minX;
  const y0 = bounds.minY;
  const x1 = bounds.maxX;
  const y1 = bounds.maxY;
  if (x1 < x0 || y1 < y0) return Infinity;

  return rayBoxHitTXY(ray.ox, ray.oy, ray.dx, ray.dy, x0, y0, x1, y1, tMin);
}
