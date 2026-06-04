import { assertFiniteT, biasRaw } from './easing.internal';

/**
 * Schlick-style gain scalar shaping 함수다.
 *
 * t < 0.5이면 bias(2*t, amount) / 2, 그 외 1 - bias(2 - 2*t, amount) / 2.
 * t === 0 → 0, t === 1 → 1, t === 0.5 → 0.5 (exact).
 * t는 finite number여야 한다.
 * amount는 finite number이고 0 < amount < 1이어야 한다. 위반 시 RangeError.
 *
 * @param t easing progress (보통 [0, 1])
 * @param amount gain 강도. finite, 0 < amount < 1.
 */
export function gain(t: number, amount: number): number {
  assertFiniteT(t);
  if (!Number.isFinite(amount) || amount <= 0 || amount >= 1) {
    throw new RangeError('easing gain amount must be a finite number in (0, 1)');
  }
  if (t < 0.5) {
    return biasRaw(2 * t, amount) / 2;
  }
  return 1 - biasRaw(2 - 2 * t, amount) / 2;
}
