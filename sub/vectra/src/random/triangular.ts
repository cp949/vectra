import { type RandomSource, random } from './random';

/**
 * 삼각분포 난수를 반환한다.
 *
 * `left === right`이면 degenerate distribution으로 취급해 항상 `left`를 반환한다.
 * `mode`가 `left` 또는 `right`와 같은 skewed case도 허용한다.
 *
 * @param left - 분포의 왼쪽 경계. finite number여야 한다.
 * @param mode - 분포의 최빈값. `left <= mode <= right`여야 한다.
 * @param right - 분포의 오른쪽 경계. finite number여야 한다.
 * @param rng - 난수 생성 함수. 생략하면 default entropy source를 사용한다.
 * @throws {RangeError} parameter가 finite number가 아니거나 `left <= mode <= right`를 어길 때.
 */
export const triangular = (left: number, mode: number, right: number, rng?: RandomSource): number => {
  if (!Number.isFinite(left) || !Number.isFinite(mode) || !Number.isFinite(right)) {
    throw new RangeError(
      `triangular: left, mode, right는 finite number여야 한다. 받은 값: left=${left}, mode=${mode}, right=${right}`
    );
  }
  if (left > mode || mode > right) {
    throw new RangeError(
      `triangular: left <= mode <= right를 만족해야 한다. 받은 값: left=${left}, mode=${mode}, right=${right}`
    );
  }
  if (left === right) return left;

  const u = random(rng);
  const width = right - left;
  const split = (mode - left) / width;

  if (u < split) {
    return left + Math.sqrt(u * width * (mode - left));
  }
  return right - Math.sqrt((1 - u) * width * (right - mode));
};
