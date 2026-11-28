import type { CurveIntersectionHit, CurveIntersectionOptions } from '../types';
import type { Curve, InfiniteLine } from '../types/flat-shapes.internal';
import { lineCurveIntersectionsInto } from './line-curve-intersections-into';

/**
 * infinite-line과 generic Bezier curve의 교차점을 새 배열로 반환한다.
 *
 * `curve.kind`로 quadratic/cubic을 분기해 implicit polynomial 교차를 계산한다.
 * infinite-line은 양방향이므로 line parameter range 필터를 적용하지 않는다.
 * 결과는 flat `{ x, y, kind, tLine, tCurve }`이고 `tLine`은 line parameter,
 * `tCurve`는 curve parameter `[0, 1]`이다. `kind`는 `cross`/`touch`만 사용한다.
 * `dx = dy = 0`인 line은 빈 배열이다.
 * 성능 최적화가 필요하면 `lineCurveIntersectionsInto`를 사용한다.
 *
 * @param line (ox, oy)를 지나 (dx, dy) 방향으로 뻗는 양방향 직선
 * @param curve quadratic 또는 cubic Bezier curve
 * @param options `epsilon`, `epsilonT`, `maxDepth`를 모두 지정한다. 생략하면 기본값을 쓴다.
 * @returns 새로 만든 facade hit 배열. 교차점이 없으면 빈 배열.
 */
export function lineCurveIntersections(
  line: InfiniteLine,
  curve: Curve,
  options?: Required<CurveIntersectionOptions>
): CurveIntersectionHit[] {
  return lineCurveIntersectionsInto([], line, curve, options);
}
