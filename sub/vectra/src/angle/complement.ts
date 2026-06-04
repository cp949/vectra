import { assertFiniteNumbers } from '../math/range.internal';

/**
 * angle의 complement (여각)를 반환한다.
 *
 * `Math.PI / 2 - angle`을 계산한다. 결과를 wrap하지 않는다.
 * non-finite 입력은 RangeError를 던진다.
 *
 * @param angle 여각을 계산할 angle (radian)
 */
export function complement(angle: number): number {
  assertFiniteNumbers([angle]);

  return Math.PI / 2 - angle;
}
