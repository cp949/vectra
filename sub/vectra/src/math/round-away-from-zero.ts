import { assertFiniteNumbers } from './range.internal';

/**
 * value를 0에서 멀어지는 방향으로 정수 반올림한다.
 *
 * 입력은 finite number여야 한다. 정수와 0은 그대로 반환한다.
 *
 * @param value 0에서 멀어지는 방향으로 반올림할 값
 */
export function roundAwayFromZero(value: number): number {
  assertFiniteNumbers([value]);

  if (value === 0) {
    return 0;
  }

  return value > 0 ? Math.ceil(value) : Math.floor(value);
}
