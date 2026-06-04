import type { CurveIntersectionOptions, IntersectionHit, RayLike, XYInput } from '../types';
import { rayQuadraticIntersectionsInto } from './ray-quadratic-intersections-into';

/**
 * ray와 quadratic Bezier curve의 교차점을 새 IntersectionHit[] 배열로 반환한다.
 *
 * ray를 infinite-line으로 변환해 quadraticLineIntersectionsInto를 호출한 뒤
 * tA >= 0 (ray 앞 방향) 조건에 맞는 hit만 남긴다.
 * tA는 ray line parameter (origin + direction * tA), tB는 curve parameter [0,1]이다.
 * 성능 최적화가 필요하면 `rayQuadraticIntersectionsInto`를 사용한다.
 *
 * @param ray origin에서 direction 방향으로 뻗는 반직선
 * @param p0 quadratic curve 시작점
 * @param p1 quadratic curve 제어점
 * @param p2 quadratic curve 끝점
 * @param options epsilon, epsilonT 제어 옵션. 미지정 시 기본값 사용.
 * @returns 새로 만든 IntersectionHit 배열. 교차점이 없으면 빈 배열.
 */
export function rayQuadraticIntersections(
  ray: RayLike,
  p0: XYInput,
  p1: XYInput,
  p2: XYInput,
  options?: CurveIntersectionOptions
): IntersectionHit[] {
  const out: IntersectionHit[] = [];
  rayQuadraticIntersectionsInto(out, ray, p0, p1, p2, options);
  return out;
}
