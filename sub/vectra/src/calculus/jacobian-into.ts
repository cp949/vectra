import {
  assertFiniteArithmetic,
  assertPointEntriesFinite,
  assertPointIsArray,
  commitMatrixInto,
  resolveMultivariateMethod,
  resolveMultivariateStep,
} from './multivariate-validate.internal';
import type { MultivariateDerivativeOptions } from './types';

/**
 * vector-valued multivariate function `f`의 `point`에서의 Jacobian matrix를 finite-difference로 계산해 `out`에 기록한다.
 *
 * result convention은 row = output component, column = input dimension이다. 즉
 * `out[k][i] = ∂f_k / ∂x_i`이며 shape는 `[m, n]`(`m = f(point).length`, `n = point.length`)이다.
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
 * callback 결과는 finite number를 entry로 갖는 array(`readonly number[]`)여야 한다. array가 아니면
 * `TypeError`, entry가 non-finite면 `RangeError`. 모든 evaluation의 result length는 baseline result
 * length(`m`)와 같아야 한다. 다르면 `RangeError`.
 * `point.length === 0`이면 callback을 단 한 번 호출해 `m`을 결정하고 결과로 `m x 0` matrix(빈 row가
 * `m`개)를 기록한다.
 * subtraction/division 결과 non-finite면 `RangeError`. 결과 entry의 `-0`은 `0`으로 canonicalize한다.
 * validation 또는 계산이 실패하면 `out`은 호출 전 상태 그대로 남는다(모든 산술이 끝난 뒤 commit).
 * `out` 또는 `out[k]`가 `point`와 같은 array여도 안전하다. perturbation은 fresh `point.slice()`를
 * 사용하므로 caller의 `point`나 nested aliasing target은 mutate되지 않는다.
 * 반환값은 `out`이다.
 *
 * @param out Jacobian matrix를 기록할 writable storage. 호출 전 길이/row 형태는 무시되고 commit 후
 *   shape는 `[m, n]`이 된다. 기존 row가 array가 아니면 새 row가 만들어진다.
 * @param f point마다 호출할 vector-valued multivariate function. finite number entry로 구성된 array를
 *   반환해야 한다. side effect는 호출자가 책임진다. helper는 fresh perturbed point 배열을 전달하므로
 *   callback이 인자를 mutate해도 다음 evaluation에 영향을 주지 않는다.
 * @param point Jacobian을 계산할 base point. 모든 entry는 finite number.
 * @param options finite-difference 옵션. `method` 기본 `"central"`, `step` 기본 `1e-5`.
 */
export function jacobianInto(
  out: number[][],
  f: (point: readonly number[]) => readonly number[],
  point: readonly number[],
  options?: MultivariateDerivativeOptions
): number[][] {
  if (typeof f !== 'function') {
    throw new TypeError(`f must be a function, got ${typeof f}`);
  }
  assertPointIsArray(point);

  const method = resolveMultivariateMethod(options);
  const steps = resolveMultivariateStep(options, point.length);
  assertPointEntriesFinite(point);

  // baseline 평가. forward/backward는 산술에 baseline을 직접 사용하고, central도 m 결정을 위해 한 번
  // 호출한다. callback 호출 시 fresh slice를 넘겨 caller의 point가 mutate되지 않도록 한다.
  const baseInput = point.slice();
  const baseline = evaluateVectorCallback(f, baseInput, 'f(point)');
  const m = baseline.length;

  if (point.length === 0) {
    // m x 0 matrix: 빈 row가 m개. baseline은 이미 finite 검증을 통과했다.
    const temp: number[][] = new Array(m);
    for (let r = 0; r < m; r++) {
      temp[r] = [];
    }
    commitMatrixInto(out, temp);
    return out;
  }

  const n = point.length;
  // temp[k][i] = ∂f_k/∂x_i. fresh 2D array로 만들어 out aliasing을 격리한다.
  const temp: number[][] = new Array(m);
  for (let r = 0; r < m; r++) {
    const row = new Array<number>(n);
    for (let c = 0; c < n; c++) {
      row[c] = 0;
    }
    temp[r] = row;
  }

  for (let i = 0; i < n; i++) {
    const h = steps[i];

    if (method === 'central') {
      const plus = point.slice();
      plus[i] = point[i] + h;
      const fPlus = evaluateVectorCallback(f, plus, `f(point + step[${i}] * e_${i})`);
      assertResultLength(fPlus, m, `f(point + step[${i}] * e_${i})`);

      const minus = point.slice();
      minus[i] = point[i] - h;
      const fMinus = evaluateVectorCallback(f, minus, `f(point - step[${i}] * e_${i})`);
      assertResultLength(fMinus, m, `f(point - step[${i}] * e_${i})`);

      const denom = 2 * h;
      for (let k = 0; k < m; k++) {
        const diff = fPlus[k] - fMinus[k];
        assertFiniteArithmetic(diff, `jacobian diff at [${k}][${i}]`);
        const value = diff / denom;
        assertFiniteArithmetic(value, `jacobian entry at [${k}][${i}]`);
        temp[k][i] = value;
      }
    } else if (method === 'forward') {
      const plus = point.slice();
      plus[i] = point[i] + h;
      const fPlus = evaluateVectorCallback(f, plus, `f(point + step[${i}] * e_${i})`);
      assertResultLength(fPlus, m, `f(point + step[${i}] * e_${i})`);

      for (let k = 0; k < m; k++) {
        const diff = fPlus[k] - baseline[k];
        assertFiniteArithmetic(diff, `jacobian diff at [${k}][${i}]`);
        const value = diff / h;
        assertFiniteArithmetic(value, `jacobian entry at [${k}][${i}]`);
        temp[k][i] = value;
      }
    } else {
      // backward
      const minus = point.slice();
      minus[i] = point[i] - h;
      const fMinus = evaluateVectorCallback(f, minus, `f(point - step[${i}] * e_${i})`);
      assertResultLength(fMinus, m, `f(point - step[${i}] * e_${i})`);

      for (let k = 0; k < m; k++) {
        const diff = baseline[k] - fMinus[k];
        assertFiniteArithmetic(diff, `jacobian diff at [${k}][${i}]`);
        const value = diff / h;
        assertFiniteArithmetic(value, `jacobian entry at [${k}][${i}]`);
        temp[k][i] = value;
      }
    }
  }

  commitMatrixInto(out, temp);
  return out;
}

// callback이 array를 반환했는지, 모든 entry가 finite number인지 검증한다. 위반 시 TypeError 또는
// RangeError. 검증을 통과하면 동일 array를 반환한다. entry가 number type이 아닌 경우도 RangeError로
// 분류한다(non-finite와 같은 카테고리: "entry를 finite number로 쓸 수 없다"는 동일한 결함).
function evaluateVectorCallback(
  f: (point: readonly number[]) => readonly number[],
  input: readonly number[],
  name: string
): readonly number[] {
  const value = f(input);
  if (!Array.isArray(value)) {
    throw new TypeError(`${name} must return a readonly number[], got ${typeof value}`);
  }
  for (let k = 0; k < value.length; k++) {
    const entry = value[k];
    if (typeof entry !== 'number' || !Number.isFinite(entry)) {
      throw new RangeError(`${name}[${k}] must be a finite number, got ${String(entry)}`);
    }
  }
  return value;
}

// 모든 evaluation의 result length가 baseline result length와 같아야 한다.
function assertResultLength(value: readonly number[], expected: number, name: string): void {
  if (value.length !== expected) {
    throw new RangeError(`${name} length must equal baseline length=${expected}, got ${value.length}`);
  }
}
