import { float } from './float';
import type { RandomSource } from './random';

/**
 * `[-PI, PI)` 범위의 각도(라디안)를 균등 분포로 반환한다.
 *
 * `rng`가 0을 반환하면 `-Math.PI`를 반환하고, 0.5를 반환하면 0을 반환한다.
 *
 * @param rng - 난수 생성 함수. 생략하면 default entropy source를 사용한다.
 */
export const angle = (rng?: RandomSource): number => float(-Math.PI, Math.PI, rng);
