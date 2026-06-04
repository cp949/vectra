import { assertFiniteNumbers } from '../math/range.internal';
import { angleDelta } from './angle-delta';

/**
 * a에서 b까지 최단 circular midpoint angle을 반환한다.
 *
 * `a + angleDelta(a, b) / 2`를 계산한다. 결과를 별도 wrap하지 않는다.
 * antipodal tie는 `angleDelta` 정책에 따라 negative direction을 선택한다.
 * non-finite 입력은 RangeError를 던진다.
 *
 * @param a 기준 angle (radian)
 * @param b 목표 angle (radian)
 */
export function bisectAngle(a: number, b: number): number {
  assertFiniteNumbers([a, b]);

  return a + angleDelta(a, b) / 2;
}
