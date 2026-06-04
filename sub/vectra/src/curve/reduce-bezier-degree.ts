import type { BezierDegreeReductionOptions, QuadraticCurveWritable, XYInput } from '../types';
import { reduceBezierDegreeInto } from './reduce-bezier-degree-into';

/**
 * cubic Bezier curve를 quadratic Bezier curve로 근사 축소하여 성공 시 새 object로 반환한다.
 *
 * `reduceBezierDegreeInto`의 allocating companion. 성공 시 plain object `{ p0, p1, p2 }`를 반환하고,
 * tolerance 초과 또는 max error가 non-finite이면 `undefined`를 반환한다.
 *
 * 축소 알고리즘과 성공 판정은 `reduceBezierDegreeInto`를 따른다.
 *
 * @param p0 cubic curve 시작점
 * @param p1 cubic curve 첫 번째 제어점
 * @param p2 cubic curve 두 번째 제어점
 * @param p3 cubic curve 끝점
 * @param options 축소 tolerance 옵션. `tolerance`가 finite number가 아니거나 음수이면 RangeError.
 */
export function reduceBezierDegree(
  p0: XYInput,
  p1: XYInput,
  p2: XYInput,
  p3: XYInput,
  options?: BezierDegreeReductionOptions
): QuadraticCurveWritable | undefined {
  const out: QuadraticCurveWritable = {
    p0: { x: 0, y: 0 },
    p1: { x: 0, y: 0 },
    p2: { x: 0, y: 0 },
  };
  return reduceBezierDegreeInto(out, p0, p1, p2, p3, options) ? out : undefined;
}
