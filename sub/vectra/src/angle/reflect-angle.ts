import { assertFiniteNumbers } from '../math/range.internal';

/**
 * axisAngle을 축으로 angle scalar를 반사한 값을 반환한다.
 *
 * 계산식은 `2 * axisAngle - angle`이다. 결과를 자동 normalize하지 않는다.
 * 큰 finite 입력의 계산 overflow는 조용히 `Infinity`로 반환하지 않고 RangeError를 던진다.
 * non-finite 입력은 RangeError를 던진다.
 *
 * @param angle 반사할 angle (radian)
 * @param axisAngle 반사 축이 되는 angle (radian)
 */
export function reflectAngle(angle: number, axisAngle: number): number {
  assertFiniteNumbers([angle, axisAngle]);

  const reflected = 2 * axisAngle - angle;

  if (!Number.isFinite(reflected)) {
    throw new RangeError(`reflectAngle result overflowed, got ${String(reflected)}`);
  }

  return reflected;
}
