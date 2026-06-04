import { sumFiniteValues } from './validate.internal';

/**
 * 두 vector의 평균과 centered delta product sum, 각 vector의 centered 제곱합을 한 번에 계산한다.
 *
 * 단계별 동작:
 *  1. `sumFiniteValues`로 두 vector를 독립 검증한다(entry finite + 누적 sum finite). caller field
 *     이름을 그대로 message에 노출하기 위해 `first`/`second`를 인자로 넘긴다.
 *  2. 두 vector의 평균을 계산하고 finite를 가드한다.
 *  3. 각 index에 대해 `dx = first[i] - meanX`, `dy = second[i] - meanY`를 계산하고 finite를 검증한다.
 *  4. `dx * dy`, `dx * dx`, `dy * dy`, 각 누적 sum의 finite를 매 step 검증한다.
 *
 * 어느 단계든 위반 시 `RangeError`. caller는 호출 전 두 vector가 array이고 length가 같고 1 이상임을
 * 보장한다.
 *
 * @param first 첫 vector. finite entry로만 구성된다.
 * @param second 같은 길이의 둘째 vector. finite entry로만 구성된다.
 * @returns `meanX`, `meanY`, `productSum`, `squaredSumX`, `squaredSumY`.
 */
export function computeCovarianceStats(
  first: readonly number[],
  second: readonly number[]
): {
  meanX: number;
  meanY: number;
  productSum: number;
  squaredSumX: number;
  squaredSumY: number;
} {
  const length = first.length;
  // 두 vector를 독립 검증해야 한다. caller field 컨텍스트(`first`/`second`)를 error message에
  // 그대로 노출하기 위해 동일 helper에 인자 이름을 넘긴다.
  const sumX = sumFiniteValues(first, 'first');
  const sumY = sumFiniteValues(second, 'second');

  const meanX = sumX / length;
  if (!Number.isFinite(meanX)) {
    throw new RangeError(`first mean must be finite, got ${String(meanX)}`);
  }
  const meanY = sumY / length;
  if (!Number.isFinite(meanY)) {
    throw new RangeError(`second mean must be finite, got ${String(meanY)}`);
  }

  let productSum = 0;
  let squaredSumX = 0;
  let squaredSumY = 0;
  for (let i = 0; i < length; i++) {
    const dx = first[i] - meanX;
    if (!Number.isFinite(dx)) {
      throw new RangeError(`first centered entry at index ${i} must be finite, got ${String(dx)}`);
    }
    const dy = second[i] - meanY;
    if (!Number.isFinite(dy)) {
      throw new RangeError(`second centered entry at index ${i} must be finite, got ${String(dy)}`);
    }
    const product = dx * dy;
    if (!Number.isFinite(product)) {
      throw new RangeError(`centered product at index ${i} must be finite, got ${String(product)}`);
    }
    productSum += product;
    if (!Number.isFinite(productSum)) {
      throw new RangeError(`product sum must be finite, got ${String(productSum)} at index ${i}`);
    }
    const sqX = dx * dx;
    if (!Number.isFinite(sqX)) {
      throw new RangeError(`first squared delta at index ${i} must be finite, got ${String(sqX)}`);
    }
    squaredSumX += sqX;
    if (!Number.isFinite(squaredSumX)) {
      throw new RangeError(`first squared sum must be finite, got ${String(squaredSumX)} at index ${i}`);
    }
    const sqY = dy * dy;
    if (!Number.isFinite(sqY)) {
      throw new RangeError(`second squared delta at index ${i} must be finite, got ${String(sqY)}`);
    }
    squaredSumY += sqY;
    if (!Number.isFinite(squaredSumY)) {
      throw new RangeError(`second squared sum must be finite, got ${String(squaredSumY)} at index ${i}`);
    }
  }

  return { meanX, meanY, productSum, squaredSumX, squaredSumY };
}
