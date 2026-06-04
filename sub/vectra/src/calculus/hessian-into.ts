import {
  assertFiniteArithmetic,
  assertFiniteCallbackScalar,
  assertPointEntriesFinite,
  assertPointIsArray,
  commitMatrixInto,
  resolveMultivariateMethod,
  resolveMultivariateStep,
} from './multivariate-validate.internal';
import type { MultivariateDerivativeOptions } from './types';

/**
 * scalar multivariate function `f`의 `point`에서의 Hessian matrix를 second-order central finite-difference로 계산해 `out`에 기록한다.
 *
 * result는 `n x n` symmetric matrix이며 `out[i][j] = ∂²f / ∂x_i ∂x_j`(`n = point.length`)다.
 * diagonal은 `(f(x + h_i e_i) - 2 f(x) + f(x - h_i e_i)) / h_i^2`로,
 * off-diagonal은 central mixed partial `(f(x + h_i e_i + h_j e_j) - f(x + h_i e_i - h_j e_j) - f(x - h_i e_i + h_j e_j) + f(x - h_i e_i - h_j e_j)) / (4 h_i h_j)`로 계산한다.
 * symmetry는 같은 산술 결과를 `out[i][j]`와 `out[j][i]`에 함께 기록해 보장한다(재계산하지 않는다).
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
 * `point.length === 0`이면 빈 `[]` matrix를 commit하고 `f`를 호출하지 않는다.
 * baseline `f(point)`는 한 번만 평가해 모든 diagonal 항에서 재사용한다. callback 결과는 finite number여야
 * 하고, 위반 시 `RangeError`. subtraction/division 결과 non-finite면 `RangeError`. 결과 entry의 `-0`은
 * `0`으로 canonicalize한다.
 * validation 또는 계산이 실패하면 `out`은 호출 전 상태 그대로 남는다(모든 산술이 끝난 뒤 commit).
 * `out` 또는 `out[k]`가 `point`와 같은 array여도 안전하다. perturbation은 fresh `point.slice()`를
 * 사용하므로 caller의 `point`나 nested aliasing target은 mutate되지 않는다.
 * 반환값은 `out`이다.
 *
 * @param out Hessian matrix를 기록할 writable storage. 호출 전 길이/row 형태는 무시되고 commit 후
 *   shape는 `[n, n]`이 된다. 기존 row가 array가 아니면 새 row가 만들어진다.
 * @param f point마다 호출할 scalar multivariate function. finite number를 반환해야 한다. side effect는
 *   호출자가 책임진다. helper는 fresh perturbed point 배열을 전달하므로 callback이 인자를 mutate해도
 *   다음 evaluation에 영향을 주지 않는다.
 * @param point Hessian을 계산할 base point. 모든 entry는 finite number.
 * @param options finite-difference 옵션. `method`는 `"central"`만 허용(기본 `"central"`), `step` 기본 `1e-5`.
 */
export function hessianInto(
  out: number[][],
  f: (point: readonly number[]) => number,
  point: readonly number[],
  options?: MultivariateDerivativeOptions
): number[][] {
  if (typeof f !== 'function') {
    throw new TypeError(`f must be a function, got ${typeof f}`);
  }
  assertPointIsArray(point);

  const method = resolveMultivariateMethod(options);
  if (method !== 'central') {
    throw new RangeError(`hessian only supports central method, got ${String(method)}`);
  }
  const steps = resolveMultivariateStep(options, point.length);
  assertPointEntriesFinite(point);

  const n = point.length;
  if (n === 0) {
    commitMatrixInto(out, []);
    return out;
  }

  // baseline f(point)는 diagonal에서만 사용한다. fresh slice를 callback에 전달한다.
  const baseInput = point.slice();
  const baseline = f(baseInput);
  assertFiniteCallbackScalar(baseline, 'f(point)');

  // temp[i][j] = ∂²f/∂x_i∂x_j. fresh 2D array로 out aliasing을 격리한다.
  const temp: number[][] = new Array(n);
  for (let r = 0; r < n; r++) {
    const row = new Array<number>(n);
    for (let c = 0; c < n; c++) {
      row[c] = 0;
    }
    temp[r] = row;
  }

  // diagonal: H[i][i] = (f(x + h_i e_i) - 2 f(x) + f(x - h_i e_i)) / h_i^2.
  for (let i = 0; i < n; i++) {
    const h = steps[i];

    const plus = point.slice();
    plus[i] = point[i] + h;
    const fPlus = f(plus);
    assertFiniteCallbackScalar(fPlus, `f(point + step[${i}] * e_${i})`);

    const minus = point.slice();
    minus[i] = point[i] - h;
    const fMinus = f(minus);
    assertFiniteCallbackScalar(fMinus, `f(point - step[${i}] * e_${i})`);

    const numerator = fPlus - 2 * baseline + fMinus;
    assertFiniteArithmetic(numerator, `hessian diagonal numerator at [${i}][${i}]`);
    const denom = h * h;
    assertFiniteArithmetic(denom, `hessian diagonal denominator at [${i}][${i}]`);
    const value = numerator / denom;
    assertFiniteArithmetic(value, `hessian entry at [${i}][${i}]`);
    temp[i][i] = value;
  }

  // off-diagonal: H[i][j] = (f(++) - f(+-) - f(-+) + f(--)) / (4 h_i h_j).
  // 같은 산술 결과를 temp[i][j]와 temp[j][i]에 함께 기록한다.
  for (let i = 0; i < n; i++) {
    const hi = steps[i];
    for (let j = i + 1; j < n; j++) {
      const hj = steps[j];

      const pp = point.slice();
      pp[i] = point[i] + hi;
      pp[j] = point[j] + hj;
      const fpp = f(pp);
      assertFiniteCallbackScalar(fpp, `f(point + step[${i}] * e_${i} + step[${j}] * e_${j})`);

      const pm = point.slice();
      pm[i] = point[i] + hi;
      pm[j] = point[j] - hj;
      const fpm = f(pm);
      assertFiniteCallbackScalar(fpm, `f(point + step[${i}] * e_${i} - step[${j}] * e_${j})`);

      const mp = point.slice();
      mp[i] = point[i] - hi;
      mp[j] = point[j] + hj;
      const fmp = f(mp);
      assertFiniteCallbackScalar(fmp, `f(point - step[${i}] * e_${i} + step[${j}] * e_${j})`);

      const mm = point.slice();
      mm[i] = point[i] - hi;
      mm[j] = point[j] - hj;
      const fmm = f(mm);
      assertFiniteCallbackScalar(fmm, `f(point - step[${i}] * e_${i} - step[${j}] * e_${j})`);

      const numerator = fpp - fpm - fmp + fmm;
      assertFiniteArithmetic(numerator, `hessian mixed numerator at [${i}][${j}]`);
      const denom = 4 * hi * hj;
      assertFiniteArithmetic(denom, `hessian mixed denominator at [${i}][${j}]`);
      const value = numerator / denom;
      assertFiniteArithmetic(value, `hessian entry at [${i}][${j}]`);
      temp[i][j] = value;
      temp[j][i] = value;
    }
  }

  commitMatrixInto(out, temp);
  return out;
}
