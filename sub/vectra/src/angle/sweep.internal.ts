import { positiveModulo } from '../math/range.internal';

const TWO_PI = 2 * Math.PI;

/**
 * from - to를 [0, 2π) 범위로 정규화한다.
 *
 * non-finite guard 없음. 호출자가 보장한다.
 */
export function rawSweepCw(from: number, to: number): number {
  return positiveModulo(from - to, TWO_PI);
}

/**
 * to - from을 [0, 2π) 범위로 정규화한다.
 *
 * non-finite guard 없음. 호출자가 보장한다.
 */
export function rawSweepCcw(from: number, to: number): number {
  return positiveModulo(to - from, TWO_PI);
}
