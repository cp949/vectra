import { computeMeanWithSquaredSum } from './mean-squared-sum.internal';

/**
 * `values`의 평균과 함께 centered power sum(2차/3차/4차)을 한 번에 계산한다.
 *
 * 단계별 동작:
 *  1. `computeMeanWithSquaredSum`으로 entry finite, 누적 sum/mean/centered delta/squared sum finite를
 *     검증하고 평균, deltas, squaredSum을 얻는다.
 *  2. 각 entry에 대해 `dCubed = delta³`, `dFourth = delta⁴`를 계산해 finite를 검증한다.
 *  3. `cubedSum`, `fourthSum` 누적이 매 step finite한지 검증한다.
 *
 * 어느 단계든 위반 시 `RangeError`. caller는 호출 전 `values`가 array이며 `values.length >= 1`임을
 * 보장한다.
 *
 * @param values 평균/centered power sum을 계산할 number 배열.
 * @returns `mean`, `squaredSum`, `cubedSum`, `fourthSum`, `length`.
 */
export function computeCentralMoments(values: readonly number[]): {
  mean: number;
  squaredSum: number;
  cubedSum: number;
  fourthSum: number;
  length: number;
} {
  const { mean, deltas, squaredSum } = computeMeanWithSquaredSum(values);
  const length = deltas.length;
  let cubedSum = 0;
  let fourthSum = 0;
  for (let i = 0; i < length; i++) {
    const d = deltas[i];
    // dSquared 자체는 computeMeanWithSquaredSum이 step별로 finite 검증을 이미 마친 값과 같지만,
    // 그 부산물을 helper 간에 전달하지 않으려고 같은 식을 다시 계산한다.
    const dSquared = d * d;
    const dCubed = dSquared * d;
    if (!Number.isFinite(dCubed)) {
      throw new RangeError(`cubed delta at index ${i} must be finite, got ${String(dCubed)}`);
    }
    cubedSum += dCubed;
    if (!Number.isFinite(cubedSum)) {
      throw new RangeError(`cubedSum must be finite, got ${String(cubedSum)} at index ${i}`);
    }
    const dFourth = dSquared * dSquared;
    if (!Number.isFinite(dFourth)) {
      throw new RangeError(`fourth power delta at index ${i} must be finite, got ${String(dFourth)}`);
    }
    fourthSum += dFourth;
    if (!Number.isFinite(fourthSum)) {
      throw new RangeError(`fourthSum must be finite, got ${String(fourthSum)} at index ${i}`);
    }
  }
  return { mean, squaredSum, cubedSum, fourthSum, length };
}
