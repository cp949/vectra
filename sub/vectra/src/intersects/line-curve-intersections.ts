import type { CurveIntersectionHit, CurveIntersectionOptions, CurveLike, InfiniteLineLike } from '../types';
import { lineCurveIntersectionsInto } from './line-curve-intersections-into';

/**
 * infinite-line과 generic Bezier curve의 교차점을 새 배열로 반환한다.
 *
 * `curve.kind`로 quadratic/cubic을 분기해 implicit polynomial 교차를 계산한다.
 * infinite-line은 양방향이므로 line parameter range 필터를 적용하지 않는다.
 * 결과는 flat `{ x, y, kind, tLine, tCurve }`이고 `tLine`은 line parameter,
 * `tCurve`는 curve parameter `[0, 1]`이다. `kind`는 `cross`/`touch`만 사용한다.
 * zero direction line은 빈 배열이다.
 * 성능 최적화가 필요하면 `lineCurveIntersectionsInto`를 사용한다.
 *
 * @param line infinite-line (origin + direction, 양방향)
 * @param curve quadratic 또는 cubic Bezier curve
 * @param options epsilon, epsilonT, maxDepth 제어 옵션. 미지정 시 기본값 사용.
 * @returns 새로 만든 facade hit 배열. 교차점이 없으면 빈 배열.
 */
export function lineCurveIntersections(
  line: InfiniteLineLike,
  curve: CurveLike,
  options?: CurveIntersectionOptions
): CurveIntersectionHit[] {
  const out: CurveIntersectionHit[] = [];
  lineCurveIntersectionsInto(out, line, curve, options);
  return out;
}
