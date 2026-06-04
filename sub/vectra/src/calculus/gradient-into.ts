import {
  assertFiniteArithmetic,
  assertFiniteCallbackScalar,
  assertPointEntriesFinite,
  assertPointIsArray,
  resolveMultivariateMethod,
  resolveMultivariateStep,
} from './multivariate-validate.internal';
import { commitSequenceInto } from './sequence-commit.internal';
import type { MultivariateDerivativeOptions } from './types';

/**
 * scalar multivariate function `f`의 `point`에서의 gradient를 finite-difference로 계산해 `out`에 기록한다.
 *
 * `f`는 function이어야 한다. function이 아니면 `TypeError`.
 * `point`는 `readonly number[]`이고 모든 entry는 finite number여야 한다. 위반 시 각각
 * `TypeError`/`RangeError`.
 * `options.method`는 `"forward"`/`"backward"`/`"central"` 중 하나여야 한다. 기본 `"central"`.
 * 다른 값이면 `RangeError`. `point.length === 0`이어도 method literal은 fail-fast로 검증한다.
 * `options.step`은 positive finite number 또는 length가 `point.length`와 같은 positive finite vector다.
 * 기본 `1e-5`. scalar `0`/음수/NaN/Infinity, vector length mismatch, vector entry 위반은 모두
 * `RangeError`.
 * `point.length === 0`이면 `out.length = 0`만 설정하고 `f`를 호출하지 않는다.
 * 각 partial은 fresh perturbed point(`point.slice()`)에 대해 `f`를 호출하며 caller의 `point` 배열은
 * mutate하지 않는다. callback 결과는 finite number여야 하고, 위반 시 `RangeError`.
 * subtraction/division 결과 non-finite면 `RangeError`. 결과의 `-0`은 `0`으로 canonicalize한다.
 * validation 또는 계산이 실패하면 `out`은 호출 전 상태 그대로 남는다(모든 산술이 끝난 뒤 commit).
 * `out`과 `point`가 같은 array여도 안전하다. perturbation은 fresh `point.slice()`를 사용한다.
 * 반환값은 `out`이다.
 *
 * @param out gradient vector를 기록할 writable storage. 호출 전 length는 무시되고 commit 후 정확한
 *   length(`point.length`)를 갖는다.
 * @param f point마다 호출할 scalar multivariate function. finite number를 반환해야 한다. side effect는
 *   호출자가 책임진다. helper는 fresh perturbed point 배열을 전달하므로 callback이 인자를 mutate해도
 *   다음 evaluation에 영향을 주지 않는다.
 * @param point gradient를 계산할 base point. 모든 entry는 finite number.
 * @param options finite-difference 옵션. `method` 기본 `"central"`, `step` 기본 `1e-5`.
 */
export function gradientInto(
  out: number[],
  f: (point: readonly number[]) => number,
  point: readonly number[],
  options?: MultivariateDerivativeOptions
): number[] {
  if (typeof f !== 'function') {
    throw new TypeError(`f must be a function, got ${typeof f}`);
  }
  assertPointIsArray(point);

  const method = resolveMultivariateMethod(options);
  const steps = resolveMultivariateStep(options, point.length);
  assertPointEntriesFinite(point);

  if (point.length === 0) {
    out.length = 0;
    return out;
  }

  // forward/backward는 baseline f(x)를 한 번만 평가한다. fresh slice를 callback에 전달한다.
  let baseline = 0;
  if (method === 'forward' || method === 'backward') {
    const baseInput = point.slice();
    baseline = f(baseInput);
    assertFiniteCallbackScalar(baseline, 'f(point)');
  }

  const temp = new Array<number>(point.length);
  for (let i = 0; i < point.length; i++) {
    const h = steps[i];
    let value: number;
    if (method === 'central') {
      const plus = point.slice();
      plus[i] = point[i] + h;
      const fPlus = f(plus);
      assertFiniteCallbackScalar(fPlus, `f(point + step[${i}] * e_${i})`);

      const minus = point.slice();
      minus[i] = point[i] - h;
      const fMinus = f(minus);
      assertFiniteCallbackScalar(fMinus, `f(point - step[${i}] * e_${i})`);

      const diff = fPlus - fMinus;
      assertFiniteArithmetic(diff, `gradient diff at index ${i}`);
      value = diff / (2 * h);
    } else if (method === 'forward') {
      const plus = point.slice();
      plus[i] = point[i] + h;
      const fPlus = f(plus);
      assertFiniteCallbackScalar(fPlus, `f(point + step[${i}] * e_${i})`);

      const diff = fPlus - baseline;
      assertFiniteArithmetic(diff, `gradient diff at index ${i}`);
      value = diff / h;
    } else {
      // backward
      const minus = point.slice();
      minus[i] = point[i] - h;
      const fMinus = f(minus);
      assertFiniteCallbackScalar(fMinus, `f(point - step[${i}] * e_${i})`);

      const diff = baseline - fMinus;
      assertFiniteArithmetic(diff, `gradient diff at index ${i}`);
      value = diff / h;
    }
    assertFiniteArithmetic(value, `gradient entry at index ${i}`);
    temp[i] = value;
  }

  commitSequenceInto(out, temp);
  return out;
}
