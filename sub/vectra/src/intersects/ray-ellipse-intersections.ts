import { DEFAULT_EPSILON } from '../internal/numeric';
import type { Ellipse, Ray, PointWritable } from '../types/flat-shapes.internal';
import { rayEllipseIntersectionsInto } from './ray-ellipse-intersections-into';

/**
 * ray와 ellipse circumference의 range 안 모든 교점을 새 배열로 반환한다.
 *
 * `rayEllipseIntersectionsInto`의 allocating companion이다.
 * - tangent는 접점 t가 range(`t ≥ 0`) 안일 때만 중복 없이 한 점이고, range 밖이면 빈 배열이다.
 * - proper two-point는 두 점을 ray parameter `t` 오름차순으로 반환한다.
 * - ray 시작점 (ox, oy)가 ellipse 내부이면 t ≥ 0 exit 교점 1개만 반환한다.
 * - 두 root가 모두 ray 뒤(t < 0)이면 빈 배열, contained(boundary root 없음), degenerate direction
 *   (`dx = dy = 0`), empty ellipse(rx ≤ 0 또는 ry ≤ 0)도 빈 배열을 반환한다.
 *
 * 반환 point는 매 호출 새 `{ x, y }` object다.
 * `epsilon`은 discriminant tangent 판정에만 쓰고 finite validation에는 쓰지 않는다.
 *
 * @param ray (ox, oy)에서 (dx, dy) 방향으로 뻗는 반직선 (t ≥ 0 범위)
 * @param ellipse 교점을 구할 ellipse
 * @param epsilon discriminant tangent 판정 임계값
 */
export function rayEllipseIntersections(ray: Ray, ellipse: Ellipse, epsilon = DEFAULT_EPSILON): PointWritable[] {
  const out: PointWritable[] = [];
  rayEllipseIntersectionsInto(out, ray, ellipse, epsilon);
  return out;
}
