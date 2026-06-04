import { type RandomSource, random } from './random';

/**
 * 기하분포 난수를 반환한다.
 *
 * 반환값은 첫 성공까지 필요한 시행 횟수이며 `1`부터 시작한다.
 *
 * @param p - 각 시행의 성공 확률. `0 < p <= 1`인 finite number여야 한다.
 * @param rng - 난수 생성 함수. 생략하면 default entropy source를 사용한다.
 * @throws {RangeError} p가 finite number가 아니거나 `(0, 1]` 범위를 벗어날 때.
 */
export const geometric = (p: number, rng?: RandomSource): number => {
  if (!Number.isFinite(p) || p <= 0 || p > 1) {
    throw new RangeError(`geometric: p는 (0, 1] 범위의 finite number여야 한다. 받은 값: ${p}`);
  }
  if (p === 1) return 1;

  return Math.floor(Math.log(1 - random(rng)) / Math.log(1 - p)) + 1;
};
