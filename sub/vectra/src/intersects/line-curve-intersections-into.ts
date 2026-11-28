import { cubicLineIntersectionsInto } from '../curve/cubic-line-intersections-into';
import { quadraticLineIntersectionsInto } from '../curve/quadratic-line-intersections-into';
import type { CurveIntersectionHit, CurveIntersectionOptions, IntersectionHit } from '../types';
import type { Curve, InfiniteLine } from '../types/flat-shapes.internal';
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
 * @param line infinite-line (기점 `ox`, `oy`와 방향 `dx`, `dy`를 가진 양방향 직선)
 * @param curve quadratic 또는 cubic Bezier curve
 * @param options `epsilon`, `epsilonT`, `maxDepth`를 모두 지정한다. 생략하면 기본값을 쓴다.
 * @returns 기록이 완료된 out (입력과 동일한 참조)
 */
export function lineCurveIntersectionsInto(
  out: CurveIntersectionHit[],
  line: InfiniteLine,
  curve: Curve,
  options?: Required<CurveIntersectionOptions>
): CurveIntersectionHit[] {
  const hits: IntersectionHit[] = [];
  if (curve.kind === 'quadratic') {
    quadraticLineIntersectionsInto(hits, curve, line, options);
  } else {
    cubicLineIntersectionsInto(hits, curve, line, options);
  }
  writeLineCurveHits(out, hits);
  return out;
}
