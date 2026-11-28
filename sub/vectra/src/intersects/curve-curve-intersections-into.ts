import { cubicCubicIntersectionsInto } from '../curve/cubic-cubic-intersections-into';
import { quadraticCubicIntersectionsInto } from '../curve/quadratic-cubic-intersections-into';
import { quadraticQuadraticIntersectionsInto } from '../curve/quadratic-quadratic-intersections-into';
import type { CurveIntersectionHit, CurveIntersectionOptions, IntersectionHit } from '../types';
import type { Curve } from '../types/flat-shapes.internal';
import { writeCurveCurveHits } from './curve-facade.internal';

/**
 * 두 generic Bezier curve의 교차점을 out에 기록한다.
 *
 * `curveA.kind`/`curveB.kind` 조합으로 quadratic/cubic kernel을 분기한다.
 * `(cubic, quadratic)`은 `quadraticCubic` kernel을 호출한 뒤 `tA`/`tB`를 swap해 caller 순서를 보존한다.
 * 결과는 flat `{ x, y, kind, tA, tB }`이고 `tA`는 `curveA` parameter, `tB`는 `curveB` parameter `[0, 1]`이다.
 * `kind`는 `cross`/`touch`/`overlap`을 사용한다. subdivision kernel은 approximation이다.
 * 두 curve가 같은 기하 위에서 구간을 공유하면 겹침 구간 양 끝점을 `kind: 'overlap'` hit 2건으로 기록한다.
 * out을 먼저 비우고 교차점을 push한다. 겹치지 않으면 빈 결과다.
 *
 * @param out 교차점을 기록할 facade hit 배열 (호출 전 내용은 무시되고 비워진다)
 * @param curveA quadratic 또는 cubic Bezier curve. `tA`의 기준이다.
 * @param curveB quadratic 또는 cubic Bezier curve. `tB`의 기준이다.
 * @param options `epsilon`, `epsilonT`, `maxDepth`를 모두 지정한다. 생략하면 기본값을 쓴다.
 * @returns 기록이 완료된 out (입력과 동일한 참조)
 */
export function curveCurveIntersectionsInto(
  out: CurveIntersectionHit[],
  curveA: Curve,
  curveB: Curve,
  options?: Required<CurveIntersectionOptions>
): CurveIntersectionHit[] {
  const hits: IntersectionHit[] = [];
  let swap = false;

  if (curveA.kind === 'quadratic' && curveB.kind === 'quadratic') {
    quadraticQuadraticIntersectionsInto(hits, curveA, curveB, options);
  } else if (curveA.kind === 'quadratic' && curveB.kind === 'cubic') {
    quadraticCubicIntersectionsInto(hits, curveA, curveB, options);
  } else if (curveA.kind === 'cubic' && curveB.kind === 'quadratic') {
    // kernel은 (quadratic, cubic) 순서만 제공한다 — quadratic을 A로 넣고 tA/tB를 swap해 caller 순서를 맞춘다
    quadraticCubicIntersectionsInto(hits, curveB, curveA, options);
    swap = true;
  } else if (curveA.kind === 'cubic' && curveB.kind === 'cubic') {
    cubicCubicIntersectionsInto(hits, curveA, curveB, options);
  }

  writeCurveCurveHits(out, hits, swap);
  return out;
}
