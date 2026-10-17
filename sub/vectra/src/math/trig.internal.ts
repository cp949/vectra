/**
 * 호출자가 finite x를 보장한 상태에서 sin(πx)를 stable하게 계산한다.
 *
 * integer x는 `+0`을, half-integer x는 부호가 있는 `1` 또는 `-1`을 정확히 반환한다.
 * 그 외 finite x는 `x % 2`로 reduce한 뒤 `Math.sin(Math.PI * reduced)`로 계산한다.
 * arbitrary-large argument에 대한 완전한 exactness는 보장하지 않는다.
 * `reduced`는 `(-2, 2)`의 0이 아닌 finite라 결과는 finite이고 `-0`이 되지 않는다.
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

  // reduced는 (-2, 2)의 0이 아닌 finite다. sin(product)는 product가 -0일 때만 -0이다.
  return Math.sin(Math.PI * (x % 2));
}

/**
 * 호출자가 finite x를 보장한 상태에서 cos(πx)를 stable하게 계산한다.
 *
 * integer x는 짝수면 `1`, 홀수면 `-1`을 정확히 반환한다. half-integer x는 `+0`을 반환한다.
 * 그 외 finite x는 `x % 2`로 reduce한 뒤 `Math.cos(Math.PI * reduced)`로 계산한다.
 * arbitrary-large argument에 대한 완전한 exactness는 보장하지 않는다.
 * `reduced`는 `(-2, 2)`의 0이 아닌 finite라 결과는 finite이고 `-0`이 되지 않는다.
 */
export function cosPiCore(x: number): number {
  if (Number.isInteger(x)) {
    return x % 2 === 0 ? 1 : -1;
  }

  const rem = x % 1;

  if (rem === 0.5 || rem === -0.5) {
    return 0;
  }

  // reduced는 (-2, 2)의 0이 아닌 finite다. cos는 finite 입력에서 0을 돌려주지 않는다.
  return Math.cos(Math.PI * (x % 2));
}
