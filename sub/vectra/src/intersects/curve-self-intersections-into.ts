import { cubicSelfIntersectionsInto } from '../curve/cubic-self-intersections-into';
import type { CurveIntersectionHit, CurveIntersectionOptions, CurveLike, IntersectionHit } from '../types';
import { writeCurveCurveHits } from './curve-facade.internal';

/**
 * generic Bezier curve의 자기 교차점을 out에 기록한다.
 *
 * cubic만 자기 교차점을 가질 수 있다. quadratic Bezier는 항상 빈 결과다.
 * cubic은 `cubicSelf` kernel을 호출한다.
 * 결과는 flat `{ x, y, kind, tA, tB }`이고 `tA < tB`는 같은 점을 지나는 두 curve parameter `[0, 1]`이다.
 * `kind`는 `cross`/`touch`만 사용한다. subdivision kernel은 approximation이다.
 * out을 먼저 비우고 교차점을 push한다. loop가 아닌 cubic은 빈 결과다.
 *
 * @param out 교차점을 기록할 facade hit 배열 (호출 전 내용은 무시되고 비워진다)
 * @param curve quadratic 또는 cubic Bezier curve
 * @param options epsilon, epsilonT, maxDepth 제어 옵션. 미지정 시 기본값 사용.
 */
export function curveSelfIntersectionsInto(
  out: CurveIntersectionHit[],
  curve: CurveLike,
  options?: CurveIntersectionOptions
): void {
  const hits: IntersectionHit[] = [];
  if (curve.kind === 'cubic') {
    cubicSelfIntersectionsInto(hits, curve.p0, curve.p1, curve.p2, curve.p3, options);
  }
  // quadratic Bezier는 자기 교차점이 없다 — 빈 hits로 두고 out을 비운다
  writeCurveCurveHits(out, hits, false);
}
