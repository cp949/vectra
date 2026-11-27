import { createZeroQuadraticCurve } from '../internal/curve-shapes';
import type { BezierDegreeReductionOptions } from '../types';
import type { QuadraticCurveWritable, CubicCurve } from '../types/flat-shapes.internal';
import { reduceBezierDegreeInto } from './reduce-bezier-degree-into';

/**
 * cubic Bezier curve를 quadratic Bezier curve로 근사 축소하여 성공 시 새 object로 반환한다.
 *
 * `reduceBezierDegreeInto`의 allocating companion. 성공 시 plain object `{ curve }`를 반환하고,
 * tolerance 초과 또는 max error가 non-finite이면 `undefined`를 반환한다.
 *
 * 축소 알고리즘과 성공 판정은 `reduceBezierDegreeInto`를 따른다.
 *
 * @param curve 시작점·제어점·끝점 좌표를 담은 곡선 객체
 * @param options 축소 tolerance 옵션. `tolerance`가 finite number가 아니거나 음수이면 RangeError.
 */
export function reduceBezierDegree(
  curve: CubicCurve,
  options?: Required<BezierDegreeReductionOptions>
): QuadraticCurveWritable | undefined {
  const out = createZeroQuadraticCurve();
  return reduceBezierDegreeInto(out, curve, options) ? out : undefined;
}
