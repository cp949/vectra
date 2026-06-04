import { assertFiniteNumbers } from './range.internal';

/**
 * a를 b로 나눈 뒤 floor한 floor division 값을 반환한다.
 *
 * `Math.floor(a / b)`. JS `Math.trunc`나 `%` semantics가 아니라 음수에서도 아래로 내림한다.
 * 예: `floorDiv(-7, 3) === -3`.
 * `a`, `b`는 finite number여야 하며 아니면 RangeError. `b === 0`이거나 나눗셈 결과가
 * non-finite(overflow)이면 RangeError. 결과의 -0은 0으로 정규화한다.
 *
 * @param a 피제수
 * @param b 제수. 0이면 RangeError.
 */
export function floorDiv(a: number, b: number): number {
  assertFiniteNumbers([a, b]);

  if (b === 0) {
    throw new RangeError('floorDiv divisor must not be zero');
  }

  const result = Math.floor(a / b);

  if (!Number.isFinite(result)) {
    throw new RangeError('floorDiv result must be a finite number');
  }

  return Object.is(result, -0) ? 0 : result;
}
