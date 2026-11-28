import { rayToLineFamilyParam } from '../internal/line-family';
import { lineFamilyPolygonIntersects } from '../internal/polygon-line-family-hit.internal';
import type { Polygon, Ray } from '../types/flat-shapes.internal';

/**
 * ray와 polygon이 교차하면 true를 반환한다.
 *
 * - ray는 origin에서 direction 방향으로 반무한하게 뻗는다.
 * - polygon edge와 ray의 교차 여부로 판정한다.
 * - non-degenerate ray: origin이 polygon 내부에 있으면 반드시 edge crossing이 발생해 true.
 * - degenerate direction (zero vector) ray: 점으로 환원된다. origin이 boundary 위에 있으면 true,
 *   내부에만 있으면 edge crossing이 없으므로 false.
 * - collinear 꼭짓점, self-intersecting polygon도 동일한 규칙으로 판정한다.
 * - empty polygon (좌표 수 < 6): false.
 *
 * @param polygon  교차를 검사할 polygon
 * @param ray      교차를 검사할 ray
 * @param epsilon  교차 판정 허용 오차
 *   생략하면 평행 판정이 `sin θ <= DEFAULT_EPSILON`(scale 불변)이다. 명시하면 `|cross| <= epsilon` 절대 비교다.
 */
export function intersectsPolygonRay(polygon: Polygon, ray: Ray, epsilon?: number): boolean {
  const lineParam = rayToLineFamilyParam(ray.ox, ray.oy, ray.dx, ray.dy);
  return lineFamilyPolygonIntersects(lineParam, polygon, epsilon);
}
