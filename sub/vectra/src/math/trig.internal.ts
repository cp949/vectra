/**
 * 호출자가 finite x를 보장한 상태에서 sin(πx)를 stable하게 계산한다.
 *
 * integer x는 `+0`을, half-integer x는 부호가 있는 `1` 또는 `-1`을 정확히 반환한다.
 * 그 외 finite x는 `x % 2`로 reduce한 뒤 `Math.sin(Math.PI * reduced)`로 계산한다.
 * arbitrary-large argument에 대한 완전한 exactness는 보장하지 않는다.
 * `reduced ∈ [-2, 2]`이므로 `Math.PI * reduced`와 Math.sin 결과는 finite가 약속되지만,
 * caller contract를 강화하기 위해 defensive check를 둔다. non-finite면 RangeError. signed zero는
 * `+0`으로 canonicalize한다.
 */
export function sinPiCore(x: number): number {
  if (Number.isInteger(x)) {
    return 0;
  }

  const rem = x % 1;

  if (rem === 0.5) {
    const j = x - 0.5;
    return j % 2 === 0 ? 1 : -1;
  }

  if (rem === -0.5) {
    const j = x + 0.5;
    return j % 2 === 0 ? -1 : 1;
  }

  const reduced = x % 2;
  const product = Math.PI * reduced;

  if (!Number.isFinite(product)) {
    throw new RangeError('math sinPi argument reduction is not finite');
  }

  const result = Math.sin(product);

  if (!Number.isFinite(result)) {
    throw new RangeError('math sinPi result is not finite');
  }

  return Object.is(result, -0) ? 0 : result;
}

/**
 * 호출자가 finite x를 보장한 상태에서 cos(πx)를 stable하게 계산한다.
 *
 * integer x는 짝수면 `1`, 홀수면 `-1`을 정확히 반환한다. half-integer x는 `+0`을 반환한다.
 * 그 외 finite x는 `x % 2`로 reduce한 뒤 `Math.cos(Math.PI * reduced)`로 계산한다.
 * arbitrary-large argument에 대한 완전한 exactness는 보장하지 않는다.
 * `reduced ∈ [-2, 2]`이므로 `Math.PI * reduced`와 Math.cos 결과는 finite가 약속되지만,
 * caller contract를 강화하기 위해 defensive check를 둔다. non-finite면 RangeError. signed zero는
 * `+0`으로 canonicalize한다.
 */
export function cosPiCore(x: number): number {
  if (Number.isInteger(x)) {
    return x % 2 === 0 ? 1 : -1;
  }

  const rem = x % 1;

  if (rem === 0.5 || rem === -0.5) {
    return 0;
  }

  const reduced = x % 2;
  const product = Math.PI * reduced;

  if (!Number.isFinite(product)) {
    throw new RangeError('math cosPi argument reduction is not finite');
  }

  const result = Math.cos(product);

  if (!Number.isFinite(result)) {
    throw new RangeError('math cosPi result is not finite');
  }

  return Object.is(result, -0) ? 0 : result;
}
