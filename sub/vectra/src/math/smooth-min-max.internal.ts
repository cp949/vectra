/**
 * polynomial smooth min/max 공유 계산 helper.
 *
 * public leaf smoothMin/smoothMax가 같은 blend 수식을 공유하므로 internal helper로 내린다.
 */

/**
 * polynomial smooth blend offset `h * h * k * 0.25`를 계산한다.
 *
 * `h = max(k - |a - b|, 0) / k`. `|a - b| >= k`이면 `h = 0`이 되어 smoothing이 사라지고,
 * `a === b`이면 `h = 1`이 되어 offset이 `k * 0.25`가 된다.
 * validation 없이 계산만 수행한다. 호출 전 a, b가 finite, k가 finite positive(> 0)임을
 * 호출자가 보장해야 한다.
 */
export function smoothBlendOffset(a: number, b: number, k: number): number {
  const h = Math.max(k - Math.abs(a - b), 0) / k;
  return h * h * k * 0.25;
}
