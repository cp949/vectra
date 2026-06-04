import { assertFiniteT, seatRaw } from './easing.internal';
import type { DoubleSeatOptions } from './types';

/**
 * 임의 breakpoint `center`에서 두 seat 조각을 잇는 scalar shaping 함수다.
 *
 * `t <= center`: `0.5 * (1 - (1 - t / center) ** power)`.
 * `t > center`: `0.5 + 0.5 * ((t - center) / (1 - center)) ** power`.
 * `center === 0.5`이면 `seat`과 동일하다.
 * `t === 0` → `0`, `t === center` → `0.5`, `t === 1` → `1` (formula exact).
 * `[0, 1]` 밖 `t`와 fractional `power` 조합은 NaN을 만들 수 있다 (clamp 안 함).
 * `t`는 finite number여야 한다.
 * `center`는 finite number이고 `0 < center < 1` exclusive여야 한다. 위반 시 RangeError (`0`/`1`은 division by zero).
 * `power`는 finite positive number(`> 0`)여야 한다. 위반 시 RangeError.
 *
 * @param t easing progress (보통 [0, 1])
 * @param options `center` breakpoint(finite, `0 < center < 1`, 기본 `0.5`)와 `power`(finite positive, 기본 `2`).
 */
export function doubleSeat(t: number, options?: DoubleSeatOptions): number {
  assertFiniteT(t);
  const center = options?.center ?? 0.5;
  if (!Number.isFinite(center) || center <= 0 || center >= 1) {
    throw new RangeError('easing doubleSeat center must be a finite number in (0, 1)');
  }
  const power = options?.power ?? 2;
  if (!Number.isFinite(power) || power <= 0) {
    throw new RangeError('easing doubleSeat power must be a finite positive number (> 0)');
  }
  return seatRaw(t, center, power);
}
