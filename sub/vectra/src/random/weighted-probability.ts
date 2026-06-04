import { type RandomSource, random } from './random';

/** weight 함수 기반 accept/reject sampling 결과. */
export type WeightedProbabilitySample = readonly [param: number, accepted: boolean];

/**
 * `[0, 1)` param을 뽑고 `weight(param)` 확률로 accept 여부를 반환한다.
 *
 * `weight(param)`은 `[0, 1]` 범위의 finite number여야 한다. 범위를 벗어나면 `RangeError`를
 * 던진다.
 *
 * @param weight param별 성공 확률을 반환하는 함수
 * @param rng 난수 생성 함수. 생략하면 default entropy source를 사용한다.
 */
export const weightedProbability = (
  weight: (param: number) => number,
  rng?: RandomSource
): WeightedProbabilitySample => {
  const param = random(rng);
  const probability = weight(param);

  if (!Number.isFinite(probability) || probability < 0 || probability > 1) {
    throw new RangeError(
      `weightedProbability: weight(param)는 [0, 1] 범위의 finite number여야 한다. 받은 값: ${probability}`
    );
  }

  return [param, random(rng) < probability];
};
