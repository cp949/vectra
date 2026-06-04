import { assertFiniteT, seatRaw } from './easing.internal';
import type { SeatOptions } from './types';

/**
 * 중앙(`t = 0.5`)에서 수평 접선을 갖는 대칭 ease-out-in seat scalar shaping 함수다.
 *
 * `t < 0.5`: `0.5 * (1 - (1 - 2 * t) ** power)`. `t >= 0.5`: `0.5 + 0.5 * (2 * t - 1) ** power`.
 * `t === 0` → `0`, `t === 1` → `1`, `t === 0.5` → `0.5` (formula exact).
 * `power > 1`이면 중앙 수평 접선(seat), `power === 1`이면 linear, `0 < power < 1`이면 중앙이 가팔라진다.
 * `powerInOut`(ease-in-out, 양 끝 평탄·중앙 가파름)과 반대 곡선이다.
 * `[0, 1]` 밖 `t`와 fractional `power` 조합은 NaN을 만들 수 있다 (clamp 안 함).
 * `t`는 finite number여야 한다.
 * `power`는 finite positive number(`> 0`)여야 한다. 위반 시 RangeError.
 *
 * @param t easing progress (보통 [0, 1])
 * @param options `power` 곡선 power. finite positive (`> 0`). 기본 `2`.
 */
export function seat(t: number, options?: SeatOptions): number {
  assertFiniteT(t);
  const power = options?.power ?? 2;
  if (!Number.isFinite(power) || power <= 0) {
    throw new RangeError('easing seat power must be a finite positive number (> 0)');
  }
  return seatRaw(t, 0.5, power);
}
