import { assertFiniteNumbers, assertNonZeroOrderedRange } from './range.internal';

/**
 * value를 source range에서 target range로 선형 변환한다.
 *
 * 모든 인자는 finite number여야 한다. source range는 `fromMin < fromMax`를 요구한다.
 * target range는 뒤집힌 mapping을 위해 `toMin > toMax`를 허용한다.
 * 반환값은 source range나 target range로 clamp하지 않는다.
 *
 * @param value 변환할 scalar 값
 * @param fromMin source range의 하한
 * @param fromMax source range의 상한
 * @param toMin target range의 시작값
 * @param toMax target range의 끝값
 */
export function remap(value: number, fromMin: number, fromMax: number, toMin: number, toMax: number): number {
  assertFiniteNumbers([value, fromMin, fromMax, toMin, toMax]);
  assertNonZeroOrderedRange(fromMin, fromMax);

  return toMin + ((value - fromMin) / (fromMax - fromMin)) * (toMax - toMin);
}
