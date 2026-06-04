import { assertFiniteT, logisticNormalizedRaw } from './easing.internal';
import type { LogisticOptions } from './types';

/**
 * endpoint-normalized centered logistic scalar shaping 함수다.
 *
 * raw `L(x) = 1 / (1 + exp(-steepness * (x - 0.5)))`를
 * `(L(t) - L(0)) / (L(1) - L(0))`로 정규화한다.
 * `t === 0` → `0`, `t === 1` → `1`, `t === 0.5` → `0.5` (exact endpoint).
 * 기존 `sigmoid`는 raw logistic이라 endpoint를 exact 보장하지 않고 `steepness` 0/음수를 허용한다.
 * `logistic`은 endpoint exact를 보장하고 `steepness > 0`만 허용한다.
 * `t`는 finite number여야 한다.
 * `steepness`는 finite positive number(`> 0`)여야 한다. 위반 시 RangeError.
 *
 * @param t easing progress (보통 [0, 1])
 * @param options `steepness` 곡선 기울기. finite positive (`> 0`). 기본 `10`.
 */
export function logistic(t: number, options?: LogisticOptions): number {
  assertFiniteT(t);
  const steepness = options?.steepness ?? 10;
  if (!Number.isFinite(steepness) || steepness <= 0) {
    throw new RangeError('easing logistic steepness must be a finite positive number (> 0)');
  }
  if (t === 0) return 0;
  if (t === 1) return 1;
  if (t === 0.5) return 0.5;
  return logisticNormalizedRaw(t, steepness);
}
