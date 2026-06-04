import { assertFiniteNumbers } from './range.internal';

/**
 * cancellation-resistant `Math.sqrt(1 + x) - 1`을 반환한다.
 *
 * 계산식은 `x / (Math.sqrt(1 + x) + 1)`이다. `x`는 finite number여야 하고 domain은 `x >= -1`이다.
 * `NaN`, `Infinity`, `-Infinity`, `x < -1`은 RangeError를 던진다. `x === 0`이면 `+0`을 반환하고
 * `x === -1`이면 `-1`을 반환한다. 결과가 non-finite면 RangeError를 던진다. signed zero는 `+0`으로
 * canonicalize한다.
 *
 * @param x `1 + x`의 제곱근에서 1을 뺄 scalar 값. `x >= -1`이어야 한다.
 */
export function sqrt1pm1(x: number): number {
  assertFiniteNumbers([x]);

  if (x < -1) {
    throw new RangeError('math sqrt1pm1 argument must be >= -1');
  }

  if (x === 0) {
    return 0;
  }

  // -1 fast-path는 일반 식과 결과가 같지만 분기 의도를 명시한다.
  if (x === -1) {
    return -1;
  }

  const result = x / (Math.sqrt(1 + x) + 1);

  if (!Number.isFinite(result)) {
    throw new RangeError('math sqrt1pm1 result is not finite');
  }

  return Object.is(result, -0) ? 0 : result;
}
