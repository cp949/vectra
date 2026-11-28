import { infiniteLineToLineFamilyParam, lineFamilyIntersects, rayToLineFamilyParam } from '../internal/line-family';
import type { InfiniteLine, Ray } from '../types/flat-shapes.internal';

/**
 * infinite-line과 ray가 교차하면 true를 반환한다.
 *
 * 평행 (방향 벡터가 평행, 서로 다른 직선): false.
 * collinear (infinite-line 위에 ray 시작점 (ox, oy)가 있고 방향이 평행): true.
 * `dx = dy = 0`인 degenerate ray는 점으로 환원해 infinite-line의 containment로 판정한다.
 *
 * @param infLine infinite-line
 * @param ray (ox, oy)에서 (dx, dy) 방향으로 뻗는 반직선
 * @param epsilon 평행 판정 및 거리 임계값
 *   생략하면 평행 판정이 `sin θ <= DEFAULT_EPSILON`(scale 불변)이다. 명시하면 `|cross| <= epsilon` 절대 비교다.
 */
export function intersectsInfiniteLineRay(infLine: InfiniteLine, ray: Ray, epsilon?: number): boolean {
  const rayParam = rayToLineFamilyParam(ray.ox, ray.oy, ray.dx, ray.dy);
  const infParam = infiniteLineToLineFamilyParam(infLine.ox, infLine.oy, infLine.dx, infLine.dy);

  return lineFamilyIntersects(rayParam, infParam, epsilon);
}
