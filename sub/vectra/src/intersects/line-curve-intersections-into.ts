import { cubicLineIntersectionsInto } from '../curve/cubic-line-intersections-into';
import { quadraticLineIntersectionsInto } from '../curve/quadratic-line-intersections-into';
import type {
  CurveIntersectionHit,
  CurveIntersectionOptions,
  CurveLike,
  InfiniteLineLike,
  IntersectionHit,
} from '../types';
import { writeLineCurveHits } from './curve-facade.internal';

/**
 * infinite-line과 generic Bezier curve의 교차점을 out에 기록한다.
 *
 * `curve.kind`로 quadratic/cubic을 분기해 implicit polynomial 교차를 계산한다.
 * infinite-line은 양방향이므로 line parameter range 필터를 적용하지 않는다.
 * 결과는 flat `{ x, y, kind, tLine, tCurve }`이고 `tLine`은 line parameter(origin+direction*tLine),
 * `tCurve`는 curve parameter `[0, 1]`이다. `kind`는 `cross`/`touch`만 사용한다.
 * out을 먼저 비우고 교차점을 push한다. zero direction line은 빈 결과다.
 *
 * @param out 교차점을 기록할 facade hit 배열 (호출 전 내용은 무시되고 비워진다)
 * @param line infinite-line (origin + direction, 양방향)
 * @param curve quadratic 또는 cubic Bezier curve
 * @param options epsilon, epsilonT, maxDepth 제어 옵션. 미지정 시 기본값 사용.
 */
export function lineCurveIntersectionsInto(
  out: CurveIntersectionHit[],
  line: InfiniteLineLike,
  curve: CurveLike,
  options?: CurveIntersectionOptions
): void {
  const hits: IntersectionHit[] = [];
  if (curve.kind === 'quadratic') {
    quadraticLineIntersectionsInto(hits, curve.p0, curve.p1, curve.p2, line, options);
  } else {
    cubicLineIntersectionsInto(hits, curve.p0, curve.p1, curve.p2, curve.p3, line, options);
  }
  writeLineCurveHits(out, hits);
}
