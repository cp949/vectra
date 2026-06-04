import { assertFiniteNumbers } from './range.internal';

/**
 * 1차 방정식 ax + b = 0의 해를 반환한다.
 *
 * x = -b / a. a === 0이면 NaN을 반환한다. 모든 인자는 finite number여야 한다.
 *
 * @param a 1차항 계수
 * @param b 상수항
 */
export function solveLinear(a: number, b: number): number {
  assertFiniteNumbers([a, b]);

  if (a === 0) return Number.NaN;

  return -b / a;
}
