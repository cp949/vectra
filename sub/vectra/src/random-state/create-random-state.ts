import { createRng, type RandomSeed } from '../random/create-rng';
import type { RandomSource } from '../random/random';
import { createRandomStateFacade } from './create-random-state.facade.internal';
import type { RandomState } from './create-random-state.types.internal';

export type { RandomState } from './create-random-state.types.internal';

/**
 * seed가 있으면 reproducible RNG instance를, 없으면 default entropy source를 사용하는
 * `RandomState` instance를 만든다.
 *
 * 각 method는 동명 `random` 함수의 thin wrapper다. 마지막 `rng?` 인자가 주어지면 그 값이 우선
 * 사용되고 instance 내부 RNG는 소비되지 않는다.
 *
 * @param seed 선택적 RNG seed. 제공 시 `createRng(seed)`로 instance 내부 RNG를 만든다.
 *             생략하면 method 호출 시 helper의 default entropy source를 사용한다.
 * @throws {RangeError} `seed`가 finite number가 아닐 때(NaN/Infinity/-Infinity).
 */
export const createRandomState = (seed?: RandomSeed): RandomState => {
  const stateRng: RandomSource | undefined = seed === undefined ? undefined : createRng(seed);
  const pick = (rng?: RandomSource): RandomSource | undefined => rng ?? stateRng;

  return createRandomStateFacade(pick);
};
