import { assertFiniteNumbers } from '../math/range.internal';
import { rawAngleFromSinCos } from './angle-from-sin-cos.internal';

/**
 * sin과 cos로부터 angle을 복원한다.
 *
 * `Math.atan2(sin, cos)` 기반으로 `(-π, π]` 범위를 반환한다.
 * `Math.atan2(-0, negative)` 경계는 `Math.PI`로 정규화한다.
 * `sin === 0 && cos === 0`은 `0`을 반환한다.
 * non-finite 입력은 RangeError를 던진다.
 *
 * @param sin angle의 sine 값
 * @param cos angle의 cosine 값
 */
export function angleFromSinCos(sin: number, cos: number): number {
  assertFiniteNumbers([sin, cos]);

  return rawAngleFromSinCos(sin, cos);
}
