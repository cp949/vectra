import { jacobianInto } from './jacobian-into';
import type { MultivariateDerivativeOptions } from './types';

/**
 * vector-valued multivariate function `f`의 `point`에서의 Jacobian matrix를 finite-difference로 계산해 새 `number[][]`로 반환한다.
 *
 * result convention은 row = output component, column = input dimension이다. 즉
 * `result[k][i] = ∂f_k / ∂x_i`이며 shape는 `[m, n]`(`m = f(point).length`, `n = point.length`)이다.
 *
 * `f`는 function이어야 한다. function이 아니면 `TypeError`.
 * `point`는 `readonly number[]`이고 모든 entry는 finite number여야 한다. 위반 시 각각
 * `TypeError`/`RangeError`.
 * `options.method`는 `"forward"`/`"backward"`/`"central"` 중 하나여야 한다. 기본 `"central"`.
 * 다른 값이면 `RangeError`. `point.length === 0`이어도 method literal은 fail-fast로 검증한다.
 * `options.step`은 positive finite number 또는 length가 `point.length`와 같은 positive finite vector다.
 * 기본 `1e-5`. scalar `0`/음수/NaN/Infinity, vector length mismatch, vector entry 위반은 모두
 * `RangeError`.
 *
 * callback 결과는 finite number를 entry로 갖는 array여야 한다. array가 아니면 `TypeError`, entry가
 * non-finite면 `RangeError`. 모든 evaluation의 result length는 baseline result length(`m`)와 같아야
 * 한다. 다르면 `RangeError`. `point.length === 0`이면 callback을 한 번 호출해 `m`을 결정하고 `m x 0`
 * matrix(빈 row가 `m`개)를 반환한다.
 * caller의 `point` 배열은 mutate하지 않는다. 결과 entry의 `-0`은 `0`으로 canonicalize한다.
 *
 * @param f point마다 호출할 vector-valued multivariate function. finite number entry로 구성된 array를
 *   반환해야 한다. side effect는 호출자가 책임진다. helper는 fresh perturbed point 배열을 전달하므로
 *   callback이 인자를 mutate해도 다음 evaluation에 영향을 주지 않는다.
 * @param point Jacobian을 계산할 base point. 모든 entry는 finite number.
 * @param options finite-difference 옵션. `method` 기본 `"central"`, `step` 기본 `1e-5`.
 */
export function jacobian(
  f: (point: readonly number[]) => readonly number[],
  point: readonly number[],
  options?: MultivariateDerivativeOptions
): number[][] {
  return jacobianInto([], f, point, options);
}
