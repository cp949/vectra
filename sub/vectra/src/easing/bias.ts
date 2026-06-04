import { assertFiniteT, biasRaw } from './easing.internal';

/**
 * Schlick-style bias scalar shaping 함수다.
 *
 * 수식: t / (((1 / amount - 2) * (1 - t)) + 1)
 * t === 0 → 0, t === 1 → 1 (exact endpoint).
 * t는 finite number여야 한다.
 * amount는 finite number이고 0 < amount < 1이어야 한다. 위반 시 RangeError.
 *
 * @param t easing progress (보통 [0, 1])
 * @param amount bias 강도. finite, 0 < amount < 1.
 */
export function bias(t: number, amount: number): number {
  assertFiniteT(t);
  if (!Number.isFinite(amount) || amount <= 0 || amount >= 1) {
    throw new RangeError('easing bias amount must be a finite number in (0, 1)');
  }
  return biasRaw(t, amount);
}
