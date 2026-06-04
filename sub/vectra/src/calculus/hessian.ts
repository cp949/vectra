import { hessianInto } from './hessian-into';
import type { MultivariateDerivativeOptions } from './types';

/**
 * scalar multivariate function `f`의 `point`에서의 Hessian matrix를 second-order central finite-difference로 계산해 새 `number[][]`로 반환한다.
 *
 * result는 `n x n` symmetric matrix이며 `result[i][j] = ∂²f / ∂x_i ∂x_j`(`n = point.length`)다.
 * diagonal은 `(f(x + h_i e_i) - 2 f(x) + f(x - h_i e_i)) / h_i^2`로,
 * off-diagonal은 central mixed partial `(f(x + h_i e_i + h_j e_j) - f(x + h_i e_i - h_j e_j) - f(x - h_i e_i + h_j e_j) + f(x - h_i e_i - h_j e_j)) / (4 h_i h_j)`로 계산한다.
 * symmetry는 같은 산술 결과를 `result[i][j]`와 `result[j][i]`에 함께 기록해 보장한다(재계산하지 않는다).
 *
 * `f`는 function이어야 한다. function이 아니면 `TypeError`.
 * `point`는 `readonly number[]`이고 모든 entry는 finite number여야 한다. 위반 시 각각
 * `TypeError`/`RangeError`.
 * `options.method`는 미지정이거나 `"central"`이어야 한다. `"forward"`/`"backward"`는 `RangeError`.
 * `"forward"`/`"backward"`/`"central"` 외 literal은 `RangeError`. `point.length === 0`이어도 method
 * literal은 fail-fast로 검증한다.
 * `options.step`은 positive finite number 또는 length가 `point.length`와 같은 positive finite vector다.
 * 기본 `1e-5`. scalar `0`/음수/NaN/Infinity, vector length mismatch, vector entry 위반은 모두
 * `RangeError`.
 * `point.length === 0`이면 `[]`을 반환하고 `f`를 호출하지 않는다.
 * baseline `f(point)`는 한 번만 평가해 모든 diagonal 항에서 재사용한다. callback 결과와 산술 결과는
 * finite number여야 하며 위반 시 `RangeError`. caller의 `point` 배열은 mutate하지 않는다. 결과 entry의
 * `-0`은 `0`으로 canonicalize한다.
 *
 * @param f point마다 호출할 scalar multivariate function. finite number를 반환해야 한다. side effect는
 *   호출자가 책임진다. helper는 fresh perturbed point 배열을 전달하므로 callback이 인자를 mutate해도
 *   다음 evaluation에 영향을 주지 않는다.
 * @param point Hessian을 계산할 base point. 모든 entry는 finite number.
 * @param options finite-difference 옵션. `method`는 `"central"`만 허용(기본 `"central"`), `step` 기본 `1e-5`.
 */
export function hessian(
  f: (point: readonly number[]) => number,
  point: readonly number[],
  options?: MultivariateDerivativeOptions
): number[][] {
  return hessianInto([], f, point, options);
}
