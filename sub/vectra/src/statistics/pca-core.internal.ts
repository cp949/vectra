/**
 * `pca`/`reduceDimensions*`가 공유하는 PCA core 계산 helper.
 *
 * PCA가 필요로 하는 symmetric eigen kernel은 domain-neutral internal primitive를 사용한다.
 */

import {
  allocateSquareMatrixBuffer,
  computeCenteredDeltas,
  computeCenteredProductSum,
  computeVariableMean,
} from './matrix.internal';
import { jacobiSymmetricEigen, type OrderedEigen, orderEigenDescending } from './pca-eigen.internal';
import type { ResolvedPCAOptions } from './pca-options.internal';

/**
 * `computePcaCore`의 결과. public `PCAResult`와 동일한 numeric payload를 담는다. `pca`와
 * `reduceDimensionsInto`가 같은 internal helper를 호출하도록 PCA decomposition의 출력만 모아둔다.
 */
export interface PcaCoreResult {
  /** 정렬된 component matrix. row=component, column=original variable. rank만큼 잘려 있다. */
  readonly components: number[][];

  /** 각 component의 variance contribution. descending 순서. length === rank. */
  readonly explainedVariance: number[];

  /** 각 component의 variance contribution 비율. 합이 1 (rank > 0). length === rank. */
  readonly explainedVarianceRatio: number[];

  /** 각 variable의 평균. length === variableCount. `-0`은 `0`으로 canonicalize. */
  readonly means: number[];

  /** `useCorrelation: true`일 때 각 variable의 표준편차. 그 외에는 `undefined`. */
  readonly standardDeviations: number[] | undefined;

  /** strict positive eigenvalue 개수. `0` 이상 `variableCount` 이하 정수. */
  readonly rank: number;
}

interface PcaMoments {
  readonly means: number[];
  readonly deltas: number[][];
  readonly squaredSums: number[];
}

function computePcaMoments(variables: readonly (readonly number[])[], variableCount: number): PcaMoments {
  const means = new Array<number>(variableCount);
  const deltas: number[][] = new Array(variableCount);
  const squaredSums = new Array<number>(variableCount);
  for (let v = 0; v < variableCount; v++) {
    const samples = variables[v];
    const mean = computeVariableMean(samples, v);
    const { deltas: vDeltas, squaredSum } = computeCenteredDeltas(samples, mean, v);
    means[v] = Object.is(mean, -0) ? 0 : mean;
    deltas[v] = vDeltas;
    squaredSums[v] = squaredSum;
  }
  return { means, deltas, squaredSums };
}

function standardizeDeltasForCorrelation(
  deltas: number[][],
  squaredSums: readonly number[],
  variableCount: number,
  denominator: number
): number[] {
  const standardDeviations = new Array<number>(variableCount);
  for (let v = 0; v < variableCount; v++) {
    const sq = squaredSums[v];
    if (sq === 0) {
      throw new RangeError(`variable[${v}] variance must be non-zero for useCorrelation: true`);
    }
    const variance = sq / denominator;
    if (!Number.isFinite(variance)) {
      throw new RangeError(`variable[${v}] variance must be finite, got ${String(variance)}`);
    }
    const stddev = Math.sqrt(variance);
    // variance underflow 방어: variance > 0이어도 sqrt 결과가 subnormal 경계에서 0이 될 수 있다.
    if (!Number.isFinite(stddev) || stddev === 0) {
      throw new RangeError(`variable[${v}] stddev must be finite and non-zero, got ${String(stddev)}`);
    }
    standardDeviations[v] = stddev;
    const vDeltas = deltas[v];
    const scaled = new Array<number>(vDeltas.length);
    for (let s = 0; s < vDeltas.length; s++) {
      const value = vDeltas[s] / stddev;
      if (!Number.isFinite(value)) {
        throw new RangeError(`variable[${v}] standardized delta at sample ${s} must be finite, got ${String(value)}`);
      }
      scaled[s] = value;
    }
    deltas[v] = scaled;
  }
  return standardDeviations;
}

function buildCovarianceMatrix(
  deltas: readonly (readonly number[])[],
  variableCount: number,
  denominator: number
): number[][] {
  const cov = allocateSquareMatrixBuffer(variableCount);
  for (let r = 0; r < variableCount; r++) {
    for (let c = r; c < variableCount; c++) {
      const productSum = computeCenteredProductSum(deltas[r], deltas[c], r, c);
      const value = productSum / denominator;
      if (!Number.isFinite(value)) {
        throw new RangeError(`pca covariance at (${r}, ${c}) must be finite, got ${String(value)}`);
      }
      cov[r][c] = value;
      cov[c][r] = value;
    }
  }
  return cov;
}

function buildPcaCoreResult(
  ordered: OrderedEigen,
  means: number[],
  standardDeviations: number[] | undefined
): PcaCoreResult {
  const rank = ordered.rank;
  const components: number[][] = new Array(rank);
  const explainedVariance = new Array<number>(rank);
  let total = 0;
  for (let i = 0; i < rank; i++) {
    components[i] = ordered.components[i];
    explainedVariance[i] = ordered.values[i];
    total += ordered.values[i];
  }
  if (!Number.isFinite(total)) {
    throw new RangeError(`pca explainedVariance total must be finite, got ${String(total)}`);
  }

  const explainedVarianceRatio = new Array<number>(rank);
  for (let i = 0; i < rank; i++) {
    const value = explainedVariance[i] / total;
    if (!Number.isFinite(value)) {
      throw new RangeError(`pca explainedVarianceRatio at index ${i} must be finite, got ${String(value)}`);
    }
    explainedVarianceRatio[i] = Object.is(value, -0) ? 0 : value;
  }

  return {
    components,
    explainedVariance,
    explainedVarianceRatio,
    means,
    standardDeviations,
    rank,
  };
}

/**
 * 검증/materialize가 끝난 `variables`에 대해 PCA core 계산(centering → optional standardize →
 * covariance → symmetric Jacobi eigen → ordering/cleanup → rank trim)을 수행한다.
 *
 * caller가 보장해야 하는 전제:
 *
 *  - `resolved`는 `resolvePCAOptions` 결과다.
 *  - `assertOrientation` / `assertVarianceMode`가 이미 호출됐다.
 *  - `data`는 `assertRectangularMatrix`로 검증됐다.
 *  - `variableCount === 0` 분기는 caller가 빈 결과로 처리한다(본 helper는 `variableCount >= 1` 전제).
 *  - `sampleCount === 0`, 또는 `mode === "sample"` && `sampleCount < 2` 분기는 caller가 `RangeError`로
 *    처리한다(본 helper는 `sampleCount >= 1`, sample mode면 `sampleCount >= 2` 전제).
 *  - `variables`는 `materializeVariables` 결과다(각 entry finite 검증 완료).
 *
 * 결과 `components`는 row=component, column=original variable matrix이고 row 수는 `rank`와 같다.
 * 각 row는 unit vector이고 첫 strict non-zero loading이 양수다. `explainedVariance`/
 * `explainedVarianceRatio`는 descending 순서이고 length === rank. `useCorrelation: false`이면
 * `standardDeviations`는 `undefined`다.
 *
 * 누적 sum / centered delta / centered product / product sum / sqrt / 나눗셈 / eigen 단계 결과가
 * non-finite면 `RangeError`. `useCorrelation: true`에서 zero variance variable이 있으면 `RangeError`.
 * Jacobi 수렴 실패 또는 PSD 가정 위반(strict negative eigenvalue)이면 `undefined`.
 *
 * @param variables `variables[v][s]` shape. caller가 `materializeVariables`로 만든 fresh storage.
 * @param variableCount variable 개수. `>= 1`.
 * @param sampleCount observation 개수. population mode면 `>= 1`, sample mode면 `>= 2`.
 * @param mode denominator 정책.
 * @param resolved 검증된 PCA 옵션
 */
export function computePcaCore(
  variables: readonly (readonly number[])[],
  variableCount: number,
  sampleCount: number,
  mode: 'population' | 'sample',
  resolved: ResolvedPCAOptions
): PcaCoreResult | undefined {
  const { means, deltas, squaredSums } = computePcaMoments(variables, variableCount);
  const denominator = mode === 'sample' ? sampleCount - 1 : sampleCount;

  let standardDeviations: number[] | undefined;
  if (resolved.useCorrelation) {
    standardDeviations = standardizeDeltasForCorrelation(deltas, squaredSums, variableCount, denominator);
  }

  const cov = buildCovarianceMatrix(deltas, variableCount, denominator);
  const raw = jacobiSymmetricEigen(cov, variableCount, resolved);
  if (raw === undefined) {
    return undefined;
  }

  const ordered = orderEigenDescending(raw, variableCount, resolved.epsilon);
  if (ordered === undefined) {
    return undefined;
  }

  return buildPcaCoreResult(ordered, means, standardDeviations);
}
