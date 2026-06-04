import { assertFiniteNumbers, assertPositiveFiniteNumber } from './range.internal';

/**
 * value보다 크지 않은 gap 단위로 값을 맞춘다.
 *
 * 모든 인자는 finite number여야 하며 `gap > 0`을 요구한다. `start`는 snap grid의 기준점이다.
 *
 * @param value snap grid에 맞출 값
 * @param gap snap 간격
 * @param start snap grid의 기준점
 */
export function snapFloor(value: number, gap: number, start = 0): number {
  assertFiniteNumbers([value, start]);
  assertPositiveFiniteNumber(gap);

  return start + Math.floor((value - start) / gap) * gap;
}
