import { quadraticLineIntersectionsInto } from '../curve/quadratic-line-intersections-into';
import type { CurveIntersectionOptions, IntersectionHit } from '../types';
import type { InfiniteLine, QuadraticCurve } from '../types/flat-shapes.internal';

/**
 * infinite-line과 quadratic Bezier curve의 교차점을 outHits에 기록한다.
 *
 * quadratic Bezier와 infinite-line의 implicit polynomial 교차를 계산한다.
 * infinite-line은 양방향이므로 tA range 필터를 적용하지 않는다.
 * tB는 curve parameter [0,1]이다.
 *
 * @param outHits 결과 배열 (함수가 먼저 비운다)
 * @param line (ox, oy)를 지나 (dx, dy) 방향으로 뻗는 양방향 직선
 * @param curve 시작점·제어점·끝점 좌표를 담은 곡선 객체
 * @param options `epsilon`, `epsilonT`, `maxDepth`를 모두 지정한다. `maxDepth`는 교점 계산에 쓰지 않는다. 생략하면 기본값을 쓴다.
 * @returns 기록이 완료된 outHits (입력과 동일한 참조)
 */
export function infiniteLineQuadraticIntersectionsInto(
  outHits: IntersectionHit[],
  line: InfiniteLine,
  curve: QuadraticCurve,
  options?: Required<CurveIntersectionOptions>
): IntersectionHit[] {
  quadraticLineIntersectionsInto(outHits, curve, line, options);
  return outHits;
}
