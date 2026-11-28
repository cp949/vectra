import type { CurveIntersectionOptions, IntersectionHit } from '../types';
import type { QuadraticCurve, Ray } from '../types/flat-shapes.internal';
import { rayQuadraticIntersectionsInto } from './ray-quadratic-intersections-into';

/**
 * ray와 quadratic Bezier curve의 교차점을 새 IntersectionHit[] 배열로 반환한다.
 *
 * ray를 infinite-line으로 보고 quadraticLineIntersectionsInto를 호출한 뒤
 * tA >= 0 (ray 앞 방향) 조건에 맞는 hit만 남긴다.
 * tA는 ray parameter ((ox, oy) + (dx, dy) * tA), tB는 curve parameter [0,1]이다.
 * 성능 최적화가 필요하면 `rayQuadraticIntersectionsInto`를 사용한다.
 *
 * @param ray (ox, oy)에서 (dx, dy) 방향으로 뻗는 반직선
 * @param curve 시작점·제어점·끝점 좌표를 담은 곡선 객체
 * @param options `epsilon`, `epsilonT`, `maxDepth`를 모두 지정한다. `maxDepth`는 교점 계산에 쓰지 않는다. 생략하면 기본값을 쓴다.
 * @returns 새로 만든 IntersectionHit 배열. 교차점이 없으면 빈 배열.
 */
export function rayQuadraticIntersections(
  ray: Ray,
  curve: QuadraticCurve,
  options?: Required<CurveIntersectionOptions>
): IntersectionHit[] {
  return rayQuadraticIntersectionsInto([], ray, curve, options);
}
