import { assertFiniteNumbers, assertNonZeroOrderedRange, clampScalar } from './interpolation.internal';

/**
 * value를 source range에서 target range로 선형 변환한다.
 *
 * `math.remap`과 동일한 정책을 공유하는 discovery alias다.
 * source range는 `fromMin < fromMax`를 요구한다.
 * target range는 뒤집힌 mapping을 위해 `toMin > toMax`를 허용한다.
 * 반환값은 clamp하지 않는다.
 * 모든 인자는 finite number여야 한다.
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

/**
 * value를 source range `[fromMin, fromMax]`로 clamp한 뒤 target range로 선형 변환한다.
 *
 * result-clamp가 아닌 source-clamp 방식을 사용한다.
 * target range는 뒤집힌 mapping을 위해 `toMin > toMax`를 허용한다.
 * source range는 `fromMin < fromMax`를 요구한다.
 * 모든 인자는 finite number여야 한다.
 *
 * @param value 변환할 scalar 값
 * @param fromMin source range의 하한. value를 이 값 이상으로 clamp한다.
 * @param fromMax source range의 상한. value를 이 값 이하로 clamp한다.
 * @param toMin target range의 시작값
 * @param toMax target range의 끝값
 */
export function remapClamped(value: number, fromMin: number, fromMax: number, toMin: number, toMax: number): number {
  assertFiniteNumbers([value, fromMin, fromMax, toMin, toMax]);
  assertNonZeroOrderedRange(fromMin, fromMax);

  // source value를 source range로 clamp한 뒤 remap한다
  const clampedValue = clampScalar(value, fromMin, fromMax);

  return toMin + ((clampedValue - fromMin) / (fromMax - fromMin)) * (toMax - toMin);
}
