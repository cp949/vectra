import { assertFiniteNumbers } from '../math/range.internal';
import { rawAngleFromSinCos } from './angle-from-sin-cos.internal';

/**
 * angle 배열의 원형 평균 방향을 반환한다.
 *
 * sin 합과 cos 합의 vector mean 방향을 반환한다.
 * 완전히 상쇄되어 합이 `(0, 0)`이면 `0`을 반환한다.
 * empty array는 RangeError를 던진다. 각 원소는 finite여야 한다.
 *
 * @param angles 평균을 계산할 radian angle 배열 (읽기 전용)
 */
export function averageAngle(angles: readonly number[]): number {
  if (angles.length === 0) {
    throw new RangeError('angles array must not be empty');
  }

  assertFiniteNumbers(angles);

  let sumSin = 0;
  let sumCos = 0;

  for (const a of angles) {
    sumSin += Math.sin(a);
    sumCos += Math.cos(a);
  }

  return rawAngleFromSinCos(sumSin, sumCos);
}
