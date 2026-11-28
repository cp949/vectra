import { quadraticLineIntersectionsInto } from '../curve/quadratic-line-intersections-into';
import type { CurveIntersectionOptions, IntersectionHit } from '../types';
import type { QuadraticCurve, Ray } from '../types/flat-shapes.internal';

/**
 * ray와 quadratic Bezier curve의 교차점을 outHits에 기록한다.
 *
 * ray를 infinite-line으로 보고 quadraticLineIntersectionsInto를 호출한 뒤
 * tA >= 0 (ray 앞 방향) 조건에 맞는 hit만 남긴다.
 * tA는 ray parameter ((ox, oy) + (dx, dy) * tA), tB는 curve parameter [0,1]이다.
 *
 * @param outHits 결과 배열 (함수가 먼저 비운다)
 * @param ray (ox, oy)에서 (dx, dy) 방향으로 뻗는 반직선
 * @param curve 시작점·제어점·끝점 좌표를 담은 곡선 객체
 * @param options `epsilon`, `epsilonT`, `maxDepth`를 모두 지정한다. `maxDepth`는 교점 계산에 쓰지 않는다. 생략하면 기본값을 쓴다.
 * @returns 기록이 완료된 outHits (입력과 동일한 참조)
 */
export function rayQuadraticIntersectionsInto(
  outHits: IntersectionHit[],
  ray: Ray,
  curve: QuadraticCurve,
  options?: Required<CurveIntersectionOptions>
): IntersectionHit[] {
  quadraticLineIntersectionsInto(outHits, curve, ray, options);

  // ray는 tA >= 0 범위만 유효하다 — tA < 0 hit를 제거한다
  let i = outHits.length - 1;
  while (i >= 0) {
    if (outHits[i].tA < 0) {
      outHits.splice(i, 1);
    }
    i--;
  }
  return outHits;
}
