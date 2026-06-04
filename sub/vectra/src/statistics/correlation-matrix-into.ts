import {
  allocateSquareMatrixBuffer,
  assertOrientation,
  assertRectangularMatrix,
  commitSymmetricMatrixInto,
  computeCenteredDeltas,
  computeCenteredProductSum,
  computeVariableMean,
  materializeVariables,
} from './matrix.internal';
import type { CovarianceMatrixOptions } from './types';
import { assertVarianceMode } from './validate.internal';

/**
 * `data`의 correlation matrix를 `out`에 기록한다.
 *
 * 각 (i, j) entry는 Pearson correlation `cov(i, j) / (stddev(i) * stddev(j))`다. denominator 정책이
 * covariance/standardDeviation에 동일 적용되므로 결과 ratio는 mode와 무관하다.
 * validation, orientation 정책, ragged matrix, finite entry, variable count `0`, sample count
 * `0`/`< 2` 경계는 `covarianceMatrixInto`와 같다.
 * 어떤 variable이라도 variance가 `0`이면 `RangeError`. zero variance variable의 diagonal `1`로 덮지
 * 않는다. 결과는 square symmetric matrix이고 diagonal은 모두 `1`이다.
 * 누적 sum, centered delta, centered product, product sum, sqrt, 나눗셈, ratio가 non-finite면
 * `RangeError`. 결과 entry의 `-0`은 `0`으로 canonicalize한다.
 * validation 또는 산술 실패 시 `out`은 호출 전 상태를 유지한다. `out`과 `data`가 같은 nested array여도
 * 안전하다.
 * 반환값은 `out`이다.
 *
 * @param out correlation matrix를 기록할 writable storage. 호출 전 길이는 무시되고 commit 후 결과
 *   matrix로 교체된다.
 * @param data correlation matrix를 계산할 matrix. row-major rectangular finite number matrix.
 * @param options 옵션. `orientation` 기본 `"columns"`, `mode` 기본 `"population"`. denominator는 결과
 *   ratio에 영향을 주지 않지만 sample mode + sample count `< 2`이면 validation 단계에서 `RangeError`.
 */
export function correlationMatrixInto(
  out: number[][],
  data: readonly (readonly number[])[],
  options?: CovarianceMatrixOptions
): number[][] {
  const orientation = options?.orientation ?? 'columns';
  assertOrientation(orientation, 'options.orientation');
  const mode = options?.mode ?? 'population';
  assertVarianceMode(mode, 'options.mode');

  const { rowCount, columnCount } = assertRectangularMatrix(data, 'data');

  const earlyVariableCount = orientation === 'columns' ? columnCount : rowCount;
  if (earlyVariableCount === 0) {
    out.length = 0;
    return out;
  }

  const { variables, sampleCount, variableCount } = materializeVariables(data, rowCount, columnCount, orientation);

  if (sampleCount === 0) {
    throw new RangeError(`correlationMatrix requires sample count >= 1 when variable count > 0, got 0`);
  }
  if (mode === 'sample' && sampleCount < 2) {
    throw new RangeError(`sample correlationMatrix requires sample count >= 2, got ${sampleCount}`);
  }

  const deltas: number[][] = new Array(variableCount);
  const squaredSums = new Array<number>(variableCount);
  for (let v = 0; v < variableCount; v++) {
    const samples = variables[v];
    const mean = computeVariableMean(samples, v);
    const { deltas: vDeltas, squaredSum } = computeCenteredDeltas(samples, mean, v);
    if (squaredSum === 0) {
      throw new RangeError(`variable[${v}] variance must be non-zero for correlation`);
    }
    deltas[v] = vDeltas;
    squaredSums[v] = squaredSum;
  }

  const temp = allocateSquareMatrixBuffer(variableCount);
  for (let r = 0; r < variableCount; r++) {
    temp[r][r] = 1;
    for (let c = r + 1; c < variableCount; c++) {
      const productSum = computeCenteredProductSum(deltas[r], deltas[c], r, c);
      // sqrt(sqSumA * sqSumB)를 한 번에 계산해 sqrt 곱셈으로 인한 ULP 오차를 줄인다.
      const sqProduct = squaredSums[r] * squaredSums[c];
      if (!Number.isFinite(sqProduct)) {
        throw new RangeError(`squared sum product at (${r}, ${c}) must be finite, got ${String(sqProduct)}`);
      }
      const denominator = Math.sqrt(sqProduct);
      if (!Number.isFinite(denominator) || denominator === 0) {
        throw new RangeError(
          `correlation denominator at (${r}, ${c}) must be finite and non-zero, got ${String(denominator)}`
        );
      }
      const value = productSum / denominator;
      if (!Number.isFinite(value)) {
        throw new RangeError(`correlation at (${r}, ${c}) must be finite, got ${String(value)}`);
      }
      temp[r][c] = value;
      temp[c][r] = value;
    }
  }

  commitSymmetricMatrixInto(out, temp, variableCount);
  return out;
}
