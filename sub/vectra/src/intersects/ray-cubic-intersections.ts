import type { CurveIntersectionOptions, IntersectionHit } from '../types';
import type { CubicCurve, Ray } from '../types/flat-shapes.internal';
import { rayCubicIntersectionsInto } from './ray-cubic-intersections-into';

/**
 * ray와 cubic Bezier curve의 교차점을 새 IntersectionHit[] 배열로 반환한다.
 *
 * ray를 infinite-line으로 변환해 cubicLineIntersectionsInto를 호출한 뒤
 * tA >= 0 (ray 앞 방향) 조건에 맞는 hit만 남긴다.
 * tA는 ray line parameter (origin + direction * tA), tB는 curve parameter [0,1]이다.
 * 성능 최적화가 필요하면 `rayCubicIntersectionsInto`를 사용한다.
 *
 * @param ray 기점 `ox`, `oy`에서 방향 `dx`, `dy`로 뻗는 반직선
 * @param curve 시작점·제어점·끝점 좌표를 담은 곡선 객체
 * @param options `epsilon`, `epsilonT`, `maxDepth`를 모두 지정한다. `maxDepth`는 교점 계산에 쓰지 않는다. 생략하면 기본값을 쓴다.
 * @returns 새로 만든 IntersectionHit 배열. 교차점이 없으면 빈 배열.
 */
export function rayCubicIntersections(
  ray: Ray,
  curve: CubicCurve,
  options?: Required<CurveIntersectionOptions>
): IntersectionHit[] {
  return rayCubicIntersectionsInto([], ray, curve, options);
}
