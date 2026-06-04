import { assertFiniteNumbers } from './range.internal';
import { cosPiCore } from './trig.internal';

/**
 * `cos(Math.PI * x)`를 stable하게 계산해 반환한다.
 *
 * `x`는 finite number여야 한다. `NaN`, `Infinity`, `-Infinity`는 RangeError를 던진다.
 * integer `x`는 짝수면 `1`, 홀수면 `-1`을 정확히 반환한다. half-integer `x`는 `+0`을 반환한다.
 * 그 외 finite `x`는 `Math.cos(Math.PI * (x % 2))`로 계산하므로 arbitrary-large argument에 대한
 * 완전한 exactness는 보장하지 않는다. argument reduction 또는 결과가 non-finite면 RangeError를
 * 던진다. signed zero는 `+0`으로 canonicalize한다.
 *
 * @param x π 배수로 평가할 finite scalar 값. arbitrary-large magnitude는 reduction 정확도가 떨어진다.
 */
export function cosPi(x: number): number {
  assertFiniteNumbers([x]);

  return cosPiCore(x);
}
