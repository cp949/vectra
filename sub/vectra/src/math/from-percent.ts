import { assertFiniteNumbers } from './range.internal';

/**
 * percent 비율을 target range의 scalar 값으로 변환한다.
 *
 * 모든 인자는 finite number여야 한다. `percent`는 clamp하지 않으며 target range는 뒤집힌
 * mapping을 위해 `min > max`도 허용한다. `min === max`이면 같은 값을 반환한다.
 *
 * @param percent target range에 적용할 비율
 * @param min `percent === 0`일 때의 target 값
 * @param max `percent === 1`일 때의 target 값
 */
export function fromPercent(percent: number, min: number, max: number): number {
  assertFiniteNumbers([percent, min, max]);

  return min + (max - min) * percent;
}
