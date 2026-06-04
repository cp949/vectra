import { assertFiniteNumbers } from './range.internal';
import { sinPiCore } from './trig.internal';

/**
 * normalized sinc `sin(Math.PI * x) / (Math.PI * x)`를 반환한다.
 *
 * `x`는 finite number여야 한다. `NaN`, `Infinity`, `-Infinity`는 RangeError를 던진다.
 * `x === 0`이면 limit value `1`을 반환한다 (`+0`, `-0` 모두 같다). 그 외 finite `x`는
 * 분자를 `sinPi(x)` 정책으로 계산하고 `Math.PI * x`로 나눈다. 분모 또는 결과가 non-finite면
 * RangeError를 던진다. signed zero는 `+0`으로 canonicalize한다.
 *
 * @param x sinc를 평가할 finite scalar 값. `Math.PI * x`가 overflow되는 magnitude는 `RangeError`.
 */
export function sinc(x: number): number {
  assertFiniteNumbers([x]);

  if (x === 0) {
    return 1;
  }

  const numerator = sinPiCore(x);
  const denominator = Math.PI * x;

  if (!Number.isFinite(denominator)) {
    throw new RangeError('math sinc denominator is not finite');
  }

  const result = numerator / denominator;

  if (!Number.isFinite(result)) {
    throw new RangeError('math sinc result is not finite');
  }

  return Object.is(result, -0) ? 0 : result;
}
