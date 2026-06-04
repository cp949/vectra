import { assertFiniteT, bezierScalarRaw } from './easing.internal';

/**
 * De Casteljau 알고리즘으로 임의 차수 scalar Bezier 값을 계산한다.
 *
 * controls는 최소 1개 이상의 finite number를 담아야 한다.
 * 길이가 1이면 해당 control을 그대로 반환한다.
 * 원본 배열을 변경하지 않는다.
 * t는 finite number여야 한다.
 * controls 원소는 모두 finite number여야 한다.
 *
 * @param t Bezier 곡선 parameter
 * @param controls scalar control point 배열 (길이 >= 1, 모든 원소 finite)
 */
export function bezierScalar(t: number, controls: readonly number[]): number {
  assertFiniteT(t);
  if (controls.length === 0) {
    throw new RangeError('bezierScalar controls must have at least one element');
  }
  for (let i = 0; i < controls.length; i++) {
    if (!Number.isFinite(controls[i])) {
      throw new RangeError('bezierScalar controls must all be finite numbers');
    }
  }
  if (controls.length === 1) {
    return controls[0];
  }
  return bezierScalarRaw(t, [...controls]);
}
