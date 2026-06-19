/**
 * easing shaping raw 계산식.
 *
 * bias / logisticNormalized / seat / cliff 계열의 validation 없는 raw 수식을 모은다.
 */

// ─── bias raw ─────────────────────────────────────────────────────────────────

/**
 * Schlick-style bias 수식 계산.
 *
 * 수식: t / (((1 / amount - 2) * (1 - t)) + 1)
 * validation 없이 계산만 수행한다. 호출 전 amount가 (0, 1) 범위임을 호출자가 보장해야 한다.
 * t === 0 → 0, t === 1 → 1 (exact endpoint).
 */
export function biasRaw(t: number, amount: number): number {
  return t / ((1 / amount - 2) * (1 - t) + 1);
}

// ─── broad shaping raw ────────────────────────────────────────────────────────

/**
 * endpoint-normalized centered logistic 계산.
 *
 * raw `L(x) = 1 / (1 + exp(-steepness * (x - 0.5)))`를
 * `(L(t) - L(0)) / (L(1) - L(0))`로 정규화한다.
 * validation 없이 계산만 수행한다. 호출 전 t가 finite, steepness가 finite positive(> 0)임을
 * 호출자가 보장해야 한다. endpoint exact 고정은 호출자 책임이다.
 */
export function logisticNormalizedRaw(t: number, steepness: number): number {
  const lo = 1 / (1 + Math.exp(0.5 * steepness));
  const hi = 1 / (1 + Math.exp(-0.5 * steepness));
  const lt = 1 / (1 + Math.exp(-steepness * (t - 0.5)));
  return (lt - lo) / (hi - lo);
}

/**
 * breakpoint `center`에서 두 조각을 잇는 ease-out-in seat 계산.
 *
 * `t <= center`: `0.5 * (1 - (1 - t / center) ** power)`.
 * `t > center`: `0.5 + 0.5 * ((t - center) / (1 - center)) ** power`.
 * `t === center`에서 `0.5`, `t === 0`에서 `0`, `t === 1`에서 `1` (formula exact).
 * validation 없이 계산만 수행한다. 호출 전 t가 finite, `0 < center < 1`, power가 finite
 * positive(> 0)임을 호출자가 보장해야 한다. `[0, 1]` 밖 t와 fractional power 조합은 NaN을 만들 수 있다.
 */
export function seatRaw(t: number, center: number, power: number): number {
  if (t <= center) {
    return 0.5 * (1 - (1 - t / center) ** power);
  }
  return 0.5 + 0.5 * ((t - center) / (1 - center)) ** power;
}

/**
 * threshold 주변 width 폭의 연속(C1) smoothstep 전이 계산.
 *
 * `edge0 = threshold - width / 2`, `u = clamp((t - edge0) / width, 0, 1)`,
 * 반환 `u * u * (3 - 2 * u)`. band 밖은 평탄(`0`/`1`), `t === threshold`에서 `0.5`.
 * validation 없이 계산만 수행한다. 호출 전 t/threshold가 finite, width가 finite positive(> 0)임을
 * 호출자가 보장해야 한다.
 */
export function cliffRaw(t: number, threshold: number, width: number): number {
  const edge0 = threshold - width / 2;
  const u = (t - edge0) / width;
  if (u <= 0) return 0;
  if (u >= 1) return 1;
  return u * u * (3 - 2 * u);
}
