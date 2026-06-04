import { assertFiniteNumbers } from './range.internal';

/**
 * value에 amount를 더하되 max를 넘지 않게 제한한다.
 *
 * 모든 인자는 finite number여야 한다. `amount`는 음수를 허용하며, 이 경우 그대로 감소한다.
 *
 * @param value 더하기를 적용할 기준값
 * @param amount 더할 양
 * @param max 반환값이 넘지 않을 상한
 */
export function maxAdd(value: number, amount: number, max: number): number {
  assertFiniteNumbers([value, amount, max]);

  return Math.min(value + amount, max);
}
