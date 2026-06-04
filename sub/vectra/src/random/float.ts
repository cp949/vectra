import { type RandomSource, random } from './random';

/**
 * `[min, max)` 범위의 부동소수점 난수를 반환한다.
 *
 * `min`과 `max`를 선형 보간하며, `rng`가 0을 반환하면 `min`을 반환한다.
 * `rng`가 1을 반환하면 `max`와 같아지므로, 닫힌 상한이 필요하면 호출자가 처리해야 한다.
 *
 * @param min - 범위의 하한값 (inclusive).
 * @param max - 범위의 상한값 (exclusive, rng가 정확히 1을 반환하지 않는 한).
 * @param rng - 난수 생성 함수. 생략하면 default entropy source를 사용한다.
 */
export const float = (min: number, max: number, rng?: RandomSource): number => min + random(rng) * (max - min);
