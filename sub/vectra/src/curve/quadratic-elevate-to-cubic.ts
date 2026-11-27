import { createZeroCubicCurve } from '../internal/curve-shapes';
import type { QuadraticCurve, CubicCurveWritable } from '../types/flat-shapes.internal';
import { quadraticElevateToCubicInto } from './quadratic-elevate-to-cubic-into';

/**
 * quadratic Bezier curve를 동등한 cubic Bezier curve로 정확하게 변환하여 새 object로 반환한다.
 *
 * `quadraticElevateToCubicInto`의 allocating companion. 결과는 plain object `{ curve }`다.
 *
 * @param curve 시작점·제어점·끝점 좌표를 담은 곡선 객체
 */
export function quadraticElevateToCubic(curve: QuadraticCurve): CubicCurveWritable {
  const out = createZeroCubicCurve();
  return quadraticElevateToCubicInto(out, curve);
}
