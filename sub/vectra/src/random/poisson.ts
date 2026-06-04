import { type RandomSource, random } from './random';

/**
 * 포아송 분포 count를 반환한다.
 *
 * 초기 구현은 Knuth 알고리즘을 사용한다. 큰 `lambda`에서는 느릴 수 있고
 * `Math.exp(-lambda)` underflow 영향을 받을 수 있다.
 *
 * @param lambda - 평균 발생 횟수. `lambda >= 0`인 finite number여야 한다.
 * @param rng - 난수 생성 함수. 생략하면 default entropy source를 사용한다.
 * @throws {RangeError} lambda가 finite number가 아니거나 음수일 때.
 */
export const poisson = (lambda: number, rng?: RandomSource): number => {
  if (!Number.isFinite(lambda) || lambda < 0) {
    throw new RangeError(`poisson: lambda는 0 이상의 finite number여야 한다. 받은 값: ${lambda}`);
  }
  if (lambda === 0) return 0;

  const limit = Math.exp(-lambda);
  let product = 1;
  let count = 0;

  do {
    count += 1;
    product *= random(rng);
  } while (product > limit);

  return count - 1;
};
