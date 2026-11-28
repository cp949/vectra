import {
  infiniteLineToLineFamilyParam,
  lineFamilyIntersectionPoint,
  rayToLineFamilyParam,
} from '../internal/line-family';
import type { InfiniteLine, Ray, PointWritable } from '../types/flat-shapes.internal';

/**
 * ray와 infinite-line의 단일 교점을 out에 기록하고 true를 반환한다.
 *
 * collinear/parallel이면 false를 반환하고 out을 수정하지 않는다.
 * ray 범위 밖(t < 0)의 교점: false. aliasing 불가.
 *
 * @param out 교점 좌표를 기록할 { x, y } 객체. 실패 시 수정하지 않는다.
 * @param ray (ox, oy)에서 (dx, dy) 방향으로 뻗는 반직선 (t ≥ 0 범위)
 * @param infLine 교점을 구할 infinite-line
 * @param epsilon cross product 절대값 임계값
 *   생략하면 평행 판정이 `sin θ <= DEFAULT_EPSILON`(scale 불변)이다. 명시하면 `|cross| <= epsilon` 절대 비교다.
 */
export function singleIntersectionRayInfiniteLineInto(
  out: PointWritable,
  ray: Ray,
  infLine: InfiniteLine,
  epsilon?: number
): boolean {
  const rayParam = rayToLineFamilyParam(ray.ox, ray.oy, ray.dx, ray.dy);
  const infParam = infiniteLineToLineFamilyParam(infLine.ox, infLine.oy, infLine.dx, infLine.dy);

  return lineFamilyIntersectionPoint(out, rayParam, infParam, epsilon);
}
