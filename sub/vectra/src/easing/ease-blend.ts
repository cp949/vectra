import { assertEasingFunction, assertFiniteT, assertFiniteWeight } from './easing.internal';

/**
 * 두 ease scalar function `a`, `b`를 `weight`로 선형 혼합한 값을 반환한다.
 *
 * `a(t) * (1 - weight) + b(t) * weight`. `a(t)`와 `b(t)`를 각각 한 번씩 호출한다.
 * `weight`가 0 또는 1이면 해당 callback 결과를 그대로 반환해 signed zero를 보존한다.
 * 두 callback 결과가 `Object.is` 기준 같으면 큰 extrapolation weight에서도 그 값을 그대로 반환한다.
 * `weight`는 clamp하지 않으므로 `weight < 0`, `weight > 1`은 extrapolated blend다.
 * higher-order wrapper가 아니라 scalar 값을 직접 반환한다.
 *
 * `a`, `b`가 function이 아니면 RangeError. `weight`, `t`가 finite가 아니면 RangeError.
 * `t` 검증은 callback 호출 전에 끝낸다. `a(t)`, `b(t)`, blend 결과가 non-finite이면 RangeError.
 *
 * @param a 첫 번째 ease scalar function. function이 아니면 RangeError.
 * @param b 두 번째 ease scalar function. function이 아니면 RangeError.
 * @param weight 혼합 비율. 0이면 `a(t)`, 1이면 `b(t)`. clamp하지 않는다.
 * @param t 진행률. finite가 아니면 RangeError.
 */
export function easeBlend(a: (t: number) => number, b: (t: number) => number, weight: number, t: number): number {
  assertEasingFunction(a);
  assertEasingFunction(b);
  assertFiniteWeight(weight);
  assertFiniteT(t);

  const va = a(t);
  const vb = b(t);

  if (!Number.isFinite(va) || !Number.isFinite(vb)) {
    throw new RangeError('easing easeBlend callback result must be a finite number');
  }

  if (weight === 0) {
    return va;
  }

  if (weight === 1) {
    return vb;
  }

  if (Object.is(va, vb)) {
    return va;
  }

  const result = va * (1 - weight) + vb * weight;

  if (!Number.isFinite(result)) {
    throw new RangeError('easing easeBlend result must be a finite number');
  }

  return result;
}
