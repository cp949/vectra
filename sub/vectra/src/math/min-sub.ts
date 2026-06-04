import { assertFiniteNumbers } from './range.internal';

/**
 * value에서 amount를 빼되 min보다 작아지지 않게 제한한다.
 *
 * 모든 인자는 finite number여야 한다. `amount`는 음수를 허용하며, 이 경우 그대로 증가한다.
 *
 * @param value 빼기를 적용할 기준값
 * @param amount 뺄 양
 * @param min 반환값이 내려가지 않을 하한
 */
export function minSub(value: number, amount: number, min: number): number {
  assertFiniteNumbers([value, amount, min]);

  return Math.max(value - amount, min);
}
