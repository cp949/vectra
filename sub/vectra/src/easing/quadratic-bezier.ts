import { assertFiniteT, bezierScalarRaw } from './easing.internal';

/**
 * quadratic Bezier scalar easing 함수다.
 *
 * [0, control, 1] 세 control point에 대해 De Casteljau 알고리즘을 적용한다.
 * t === 0 → 정확히 0, t === 1 → 정확히 1 (De Casteljau 수식 보장).
 * t는 finite number여야 한다.
 * control은 finite number여야 한다.
 *
 * @param t easing progress (보통 [0, 1])
 * @param control 중간 scalar control point (finite number)
 */
export function quadraticBezier(t: number, control: number): number {
  assertFiniteT(t);
  if (!Number.isFinite(control)) {
    throw new RangeError('quadraticBezier control must be a finite number');
  }
  return bezierScalarRaw(t, [0, control, 1]);
}
