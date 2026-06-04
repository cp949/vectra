import { gradientInto } from './gradient-into';
import type { MultivariateDerivativeOptions } from './types';

/**
 * scalar multivariate function `f`의 `point`에서의 gradient를 finite-difference로 계산해 새 `number[]`로 반환한다.
 *
 * `f`는 function이어야 한다. function이 아니면 `TypeError`.
 * `point`는 `readonly number[]`이고 모든 entry는 finite number여야 한다. 위반 시 각각
 * `TypeError`/`RangeError`.
 * `options.method`는 `"forward"`/`"backward"`/`"central"` 중 하나여야 한다. 기본 `"central"`.
 * 다른 값이면 `RangeError`. `point.length === 0`이어도 method literal은 fail-fast로 검증한다.
 * `options.step`은 positive finite number 또는 length가 `point.length`와 같은 positive finite vector다.
 * 기본 `1e-5`. scalar `0`/음수/NaN/Infinity, vector length mismatch, vector entry 위반은 모두
 * `RangeError`.
 * `point.length === 0`이면 `[]`을 반환하고 `f`를 호출하지 않는다.
 * caller의 `point` 배열은 mutate하지 않는다. callback 결과와 산술 결과는 finite number여야 하며 위반
 * 시 `RangeError`. 결과의 `-0`은 `0`으로 canonicalize한다.
 *
 * @param f point마다 호출할 scalar multivariate function. finite number를 반환해야 한다. side effect는
 *   호출자가 책임진다. helper는 fresh perturbed point 배열을 전달하므로 callback이 인자를 mutate해도
 *   다음 evaluation에 영향을 주지 않는다.
 * @param point gradient를 계산할 base point. 모든 entry는 finite number.
 * @param options finite-difference 옵션. `method` 기본 `"central"`, `step` 기본 `1e-5`.
 */
export function gradient(
  f: (point: readonly number[]) => number,
  point: readonly number[],
  options?: MultivariateDerivativeOptions
): number[] {
  return gradientInto([], f, point, options);
}
