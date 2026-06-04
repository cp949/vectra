import { type RandomSource, random } from './random';

/**
 * -1 또는 1을 동일한 확률로 반환한다.
 *
 * `rng`의 반환값이 0.5 미만이면 -1, 0.5 이상이면 1을 반환한다.
 *
 * @param rng - 난수 생성 함수. 생략하면 default entropy source를 사용한다.
 */
export const sign = (rng?: RandomSource): -1 | 1 => (random(rng) < 0.5 ? -1 : 1);
