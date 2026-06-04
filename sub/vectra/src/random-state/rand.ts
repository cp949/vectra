import { createRandomState, type RandomState } from './create-random-state';

/**
 * unseeded module-level `RandomState` instance.
 *
 * 각 method는 helper의 default entropy source를 사용한다. 마지막 `rng?` override를 주면 그
 * 값이 우선 사용된다. 다른 module의 `random` domain 함수의 default 동작을 변경하지 않는다.
 */
export const rand: RandomState = createRandomState();
