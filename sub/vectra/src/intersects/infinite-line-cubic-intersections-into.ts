import { cubicLineIntersectionsInto } from '../curve/cubic-line-intersections-into';
import type {
  CurveIntersectionOptions,
  InfiniteLineLike,
  IntersectionHit,
  XYInput,
  XYObjectWritable,
  XYWritable,
} from '../types';

/**
 * infinite-line과 cubic Bezier curve의 교차점을 outHits에 push한다.
 *
 * cubic Bezier와 infinite-line의 implicit polynomial 교차를 계산한다.
 * infinite-line은 양방향이므로 tA range 필터를 적용하지 않는다.
 * tB는 curve parameter [0,1]이다.
 *
 * @param outHits 결과 배열 (호출 전 비워야 한다)
 * @param line infinite-line (origin + direction, 양방향)
 * @param p0 cubic curve 시작점
 * @param p1 cubic curve 첫 번째 제어점
 * @param p2 cubic curve 두 번째 제어점
 * @param p3 cubic curve 끝점
 * @param options epsilon, epsilonT 제어 옵션. 미지정 시 기본값 사용.
 */
export function infiniteLineCubicIntersectionsInto<P extends XYWritable = XYObjectWritable>(
  outHits: IntersectionHit<P>[],
  line: InfiniteLineLike,
  p0: XYInput,
  p1: XYInput,
  p2: XYInput,
  p3: XYInput,
  options?: CurveIntersectionOptions
): void {
  cubicLineIntersectionsInto(outHits, p0, p1, p2, p3, line, options);
}
