import {
  infiniteLineToLineFamilyParam,
  lineFamilyIntersectionPoint,
  rayToLineFamilyParam,
} from '../internal/line-family';
import type { InfiniteLine, Ray, PointWritable } from '../types/flat-shapes.internal';

/**
 * ray와 infinite-line의 단일 교점을 새 object로 반환한다.
 *
 * 교점이 있으면 `{ x, y }` object를 반환한다. 교점이 없으면 undefined를 반환한다.
 * collinear/parallel: undefined. ray 범위 밖(t < 0)의 교점: undefined.
 * allocating companion — internal helper를 직접 호출한다.
 *
 * @param ray origin에서 direction 방향으로 뻗는 반직선 (t ≥ 0 범위)
 * @param infLine 교점을 구할 infinite-line
 * @param epsilon cross product 절대값 임계값
 *   생략하면 평행 판정이 `sin θ <= DEFAULT_EPSILON`(scale 불변)이다. 명시하면 `|cross| <= epsilon` 절대 비교다.
 */
export function singleIntersectionRayInfiniteLine(
  ray: Ray,
  infLine: InfiniteLine,
  epsilon?: number
): PointWritable | undefined {
  const rayParam = rayToLineFamilyParam(ray.ox, ray.oy, ray.dx, ray.dy);
  const infParam = infiniteLineToLineFamilyParam(infLine.ox, infLine.oy, infLine.dx, infLine.dy);

  const out: PointWritable = { x: 0, y: 0 };
  return lineFamilyIntersectionPoint(out, rayParam, infParam, epsilon) ? out : undefined;
}
