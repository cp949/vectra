import type { CurveIntersectionHit, CurveIntersectionOptions } from '../types';
import type { Curve } from '../types/flat-shapes.internal';
import { curveSelfIntersectionsInto } from './curve-self-intersections-into';

/**
 * generic Bezier curve의 자기 교차점을 새 배열로 반환한다.
 *
 * cubic만 자기 교차점을 가질 수 있다. quadratic Bezier는 항상 빈 배열이다.
 * 결과는 flat `{ x, y, kind, tA, tB }`이고 `tA < tB`는 같은 점을 지나는 두 curve parameter `[0, 1]`이다.
 * `kind`는 `cross`/`touch`만 사용한다. subdivision kernel은 approximation이다.
 * 성능 최적화가 필요하면 `curveSelfIntersectionsInto`를 사용한다.
 *
 * @param curve quadratic 또는 cubic Bezier curve
 * @param options `epsilon`, `epsilonT`, `maxDepth`를 모두 지정한다. 생략하면 기본값을 쓴다.
 * @returns 새로 만든 facade hit 배열. 자기 교차점이 없으면 빈 배열.
 */
export function curveSelfIntersections(
  curve: Curve,
  options?: Required<CurveIntersectionOptions>
): CurveIntersectionHit[] {
  return curveSelfIntersectionsInto([], curve, options);
}
