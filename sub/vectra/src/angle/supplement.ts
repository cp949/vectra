import { assertFiniteNumbers } from '../math/range.internal';

/**
 * angle의 supplement (보각)를 반환한다.
 *
 * `Math.PI - angle`을 계산한다. 결과를 wrap하지 않는다.
 * non-finite 입력은 RangeError를 던진다.
 *
 * @param angle 보각을 계산할 angle (radian)
 */
export function supplement(angle: number): number {
  assertFiniteNumbers([angle]);

  return Math.PI - angle;
}
