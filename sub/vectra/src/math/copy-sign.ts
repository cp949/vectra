import { assertFiniteNumbers } from './range.internal';

/**
 * magnitude의 절댓값에 signSource의 sign bit를 적용해 반환한다.
 *
 * 모든 인자는 finite number여야 한다. `signSource`가 `-0`이면 음수 sign으로 취급한다.
 * `copySign(0, -1)`은 `-0`, `copySign(5, -0)`은 `-5`, `copySign(-5, 0)`은 `5`를 반환한다.
 *
 * @param magnitude 절댓값을 가져올 scalar 값
 * @param signSource 적용할 sign bit를 가져올 scalar 값
 */
export function copySign(magnitude: number, signSource: number): number {
  assertFiniteNumbers([magnitude, signSource]);

  const absMagnitude = Math.abs(magnitude);
  const negative = signSource < 0 || Object.is(signSource, -0);

  return negative ? -absMagnitude : absMagnitude;
}
