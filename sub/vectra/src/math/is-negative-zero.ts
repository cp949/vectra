import { assertFiniteNumbers } from './range.internal';

/**
 * value가 `-0`이면 true를 반환한다.
 *
 * 모든 인자는 finite number여야 한다. `+0`이나 non-zero finite number는 false다.
 * 판정은 `Object.is(value, -0)`로 이뤄지므로 `value === 0`만으로 흡수되는 `-0`도 구분한다.
 *
 * @param value 판정할 scalar 값
 */
export function isNegativeZero(value: number): boolean {
  assertFiniteNumbers([value]);

  return Object.is(value, -0);
}
