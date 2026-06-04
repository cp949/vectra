import { cubicCubicIntersectionsInto } from '../curve/cubic-cubic-intersections-into';
import { quadraticCubicIntersectionsInto } from '../curve/quadratic-cubic-intersections-into';
import { quadraticQuadraticIntersectionsInto } from '../curve/quadratic-quadratic-intersections-into';
import type { CurveIntersectionHit, CurveIntersectionOptions, CurveLike, IntersectionHit } from '../types';
import { writeCurveCurveHits } from './curve-facade.internal';

/**
 * 두 generic Bezier curve의 교차점을 out에 기록한다.
 *
 * `curveA.kind`/`curveB.kind` 조합으로 quadratic/cubic kernel을 분기한다.
 * `(cubic, quadratic)`은 `quadraticCubic` kernel을 호출한 뒤 `tA`/`tB`를 swap해 caller 순서를 보존한다.
 * 결과는 flat `{ x, y, kind, tA, tB }`이고 `tA`는 `curveA` parameter, `tB`는 `curveB` parameter `[0, 1]`이다.
 * `kind`는 `cross`/`touch`만 사용한다. subdivision kernel은 approximation이다.
 * out을 먼저 비우고 교차점을 push한다. 겹치지 않으면 빈 결과다.
 *
 * @param out 교차점을 기록할 facade hit 배열 (호출 전 내용은 무시되고 비워진다)
 * @param curveA quadratic 또는 cubic Bezier curve. `tA`의 기준이다.
 * @param curveB quadratic 또는 cubic Bezier curve. `tB`의 기준이다.
 * @param options epsilon, epsilonT, maxDepth 제어 옵션. 미지정 시 기본값 사용.
 */
export function curveCurveIntersectionsInto(
  out: CurveIntersectionHit[],
  curveA: CurveLike,
  curveB: CurveLike,
  options?: CurveIntersectionOptions
): void {
  const hits: IntersectionHit[] = [];
  let swap = false;

  if (curveA.kind === 'quadratic' && curveB.kind === 'quadratic') {
    quadraticQuadraticIntersectionsInto(
      hits,
      curveA.p0,
      curveA.p1,
      curveA.p2,
      curveB.p0,
      curveB.p1,
      curveB.p2,
      options
    );
  } else if (curveA.kind === 'quadratic' && curveB.kind === 'cubic') {
    quadraticCubicIntersectionsInto(
      hits,
      curveA.p0,
      curveA.p1,
      curveA.p2,
      curveB.p0,
      curveB.p1,
      curveB.p2,
      curveB.p3,
      options
    );
  } else if (curveA.kind === 'cubic' && curveB.kind === 'quadratic') {
    // kernel은 (quadratic, cubic) 순서만 제공한다 — quadratic을 A로 넣고 tA/tB를 swap해 caller 순서를 맞춘다
    quadraticCubicIntersectionsInto(
      hits,
      curveB.p0,
      curveB.p1,
      curveB.p2,
      curveA.p0,
      curveA.p1,
      curveA.p2,
      curveA.p3,
      options
    );
    swap = true;
  } else if (curveA.kind === 'cubic' && curveB.kind === 'cubic') {
    cubicCubicIntersectionsInto(
      hits,
      curveA.p0,
      curveA.p1,
      curveA.p2,
      curveA.p3,
      curveB.p0,
      curveB.p1,
      curveB.p2,
      curveB.p3,
      options
    );
  }

  writeCurveCurveHits(out, hits, swap);
}
