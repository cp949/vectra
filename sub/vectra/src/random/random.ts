import { defaultRandom } from './entropy.internal';

/** 난수 생성 함수 타입. [0, 1) 범위의 부동소수점 값을 반환한다. */
export type RandomSource = () => number;

/**
 * [0, 1) 범위의 부동소수점 난수를 반환한다.
 *
 * `rng`가 주어지면 해당 함수의 반환값을 그대로 반환한다. clamp나 normalize를 수행하지 않는다.
 * `rng`가 없으면 Web Crypto 기반 default entropy source를 사용한다.
 *
 * @param rng - 난수 생성 함수. 생략하면 default entropy source를 사용한다.
 */
export const random = (rng?: RandomSource): number => (rng ?? defaultRandom)();
