import type { CurveIntersectionOptions, InfiniteLineLike, IntersectionHit, XYInput } from '../types';
import { infiniteLineQuadraticIntersectionsInto } from './infinite-line-quadratic-intersections-into';

/**
 * infinite-line과 quadratic Bezier curve의 교차점을 새 IntersectionHit[] 배열로 반환한다.
 *
 * quadratic Bezier와 infinite-line의 implicit polynomial 교차를 계산한다.
 * infinite-line은 양방향이므로 tA range 필터를 적용하지 않는다.
 * tB는 curve parameter [0,1]이다.
 * 성능 최적화가 필요하면 `infiniteLineQuadraticIntersectionsInto`를 사용한다.
 *
 * @param line infinite-line (origin + direction, 양방향)
 * @param p0 quadratic curve 시작점
 * @param p1 quadratic curve 제어점
 * @param p2 quadratic curve 끝점
 * @param options epsilon, epsilonT 제어 옵션. 미지정 시 기본값 사용.
 * @returns 새로 만든 IntersectionHit 배열. 교차점이 없으면 빈 배열.
 */
export function infiniteLineQuadraticIntersections(
  line: InfiniteLineLike,
  p0: XYInput,
  p1: XYInput,
  p2: XYInput,
  options?: CurveIntersectionOptions
): IntersectionHit[] {
  const out: IntersectionHit[] = [];
  infiniteLineQuadraticIntersectionsInto(out, line, p0, p1, p2, options);
  return out;
}
