import type { CurveIntersectionHit, CurveIntersectionOptions, CurveLike } from '../types';
import { curveCurveIntersectionsInto } from './curve-curve-intersections-into';

/**
 * 두 generic Bezier curve의 교차점을 새 배열로 반환한다.
 *
 * `curveA.kind`/`curveB.kind` 조합으로 quadratic/cubic kernel을 분기한다.
 * 결과는 flat `{ x, y, kind, tA, tB }`이고 `tA`는 `curveA` parameter, `tB`는 `curveB` parameter `[0, 1]`이다.
 * `kind`는 `cross`/`touch`만 사용한다. subdivision kernel은 approximation이다.
 * 성능 최적화가 필요하면 `curveCurveIntersectionsInto`를 사용한다.
 *
 *
 * caller-responsibility 가정은 `curveCurveIntersectionsInto`와 동일하다.
 * @param curveA quadratic 또는 cubic Bezier curve. `tA`의 기준이다.
 * @param curveB quadratic 또는 cubic Bezier curve. `tB`의 기준이다.
 * @param options epsilon, epsilonT, maxDepth 제어 옵션. 미지정 시 기본값 사용.
 * @returns 새로 만든 facade hit 배열. 교차점이 없으면 빈 배열.
 */
export function curveCurveIntersections(
  curveA: CurveLike,
  curveB: CurveLike,
  options?: CurveIntersectionOptions
): CurveIntersectionHit[] {
  const out: CurveIntersectionHit[] = [];
  curveCurveIntersectionsInto(out, curveA, curveB, options);
  return out;
}
