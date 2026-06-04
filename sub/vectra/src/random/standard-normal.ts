import { type RandomSource, random } from './random';

/**
 * Box-Muller transform을 사용해 표준 정규 분포 난수를 반환한다.
 *
 * `u1 <= 0`인 경우 `Math.log(0) = -Infinity`를 피하기 위해
 * `Number.MIN_VALUE`로 대체한다.
 *
 * @param rng - 난수 생성 함수. 생략하면 default entropy source를 사용한다.
 * @returns 평균 0, 표준편차 1인 정규 분포에서 샘플링한 값.
 */
export const standardNormal = (rng?: RandomSource): number => {
  const u1 = Math.max(random(rng), Number.MIN_VALUE);
  const u2 = random(rng);
  return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
};
