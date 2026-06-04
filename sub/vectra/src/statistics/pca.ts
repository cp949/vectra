import { assertOrientation, assertRectangularMatrix, materializeVariables } from './matrix.internal';
import { computePcaCore } from './pca-core.internal';
import { resolvePCAOptions } from './pca-options.internal';
import type { PCAOptions, PCAResult } from './types';
import { assertVarianceMode } from './validate.internal';

/**
 * `data`의 principal component analysis 결과를 반환한다.
 *
 * `data`는 row-major `readonly (readonly number[])[]`다. top-level 또는 row가 array가 아니면
 * `TypeError`. ragged matrix는 `RangeError`. 모든 entry는 finite number여야 한다. 위반 시
 * `RangeError`. `options.orientation` 기본 `"columns"`. `"columns"`는 row=observation,
 * column=variable. `"rows"`는 row=variable, column=observation. `"columns"`/`"rows"`가 아니면
 * `RangeError`. `options.mode` 기본 `"population"`. denominator 정책은 `VarianceOptions`와 같다.
 * `mode`가 `"population"`/`"sample"`이 아니면 `RangeError`. `options.useCorrelation` 기본 `false`.
 * `true`이면 각 variable을 표준편차로 표준화한 뒤 covariance(=correlation) PCA를 수행한다.
 * `useCorrelation: true`에서 variance가 `0`인 variable이 있으면 `RangeError`. boolean이 아니면
 * `RangeError`.
 *
 * variable count가 `0`이면 `rank: 0` / 빈 결과를 반환한다. variable count가 `> 0`인데 sample count가
 * `0`이면 `RangeError`. `mode: "sample"`에서 sample count가 `< 2`이면 `RangeError`. 누적 sum,
 * centered delta, centered product, product sum, sqrt, 나눗셈, eigen 단계 결과가 non-finite면
 * `RangeError`.
 *
 * symmetric eigen은 cyclic Jacobi rotation으로 계산한다. `options.maxIterations` 기본 `100`(positive
 * safe integer), `options.tolerance` 기본 `1e-10`(0 이상 finite, 반복 수렴 판정에만 사용),
 * `options.epsilon` 기본 `1e-9`(0 이상 finite, rank 판정 / negative eigenvalue clamp / zero cleanup에만
 * 사용). 다른 finite validation에는 `epsilon`/`tolerance`를 사용하지 않는다. `maxIterations` 안에
 * 수렴하지 못하거나 PSD 가정에 어긋나는 strict negative eigenvalue가 나오면 `undefined`.
 *
 * 결과 `components`는 row=component, column=original variable인 matrix다. row 수와
 * `explainedVariance`/`explainedVarianceRatio` 길이는 `rank`와 같다. 각 component row는 unit vector이고
 * 첫 strict non-zero loading이 양수다. `explainedVariance`는 descending 순서다.
 * `explainedVarianceRatio`는 같은 순서이며 합이 `1`(rank > 0). rank가 `0`이면 `[]`. `means`는 항상
 * variable 평균 배열, `standardDeviations`는 `useCorrelation: true`일 때만 채워진다. 결과 numeric
 * entry의 `-0`은 `0`으로 canonicalize한다.
 *
 * @param data PCA를 계산할 matrix. row-major rectangular finite number matrix.
 * @param options 옵션. `orientation` 기본 `"columns"`, `mode` 기본 `"population"`,
 *   `useCorrelation` 기본 `false`, `maxIterations` 기본 `100`, `tolerance` 기본 `1e-10`, `epsilon`
 *   기본 `1e-9`.
 */
export function pca(data: readonly (readonly number[])[], options?: PCAOptions): PCAResult | undefined {
  const orientation = options?.orientation ?? 'columns';
  assertOrientation(orientation, 'options.orientation');
  const mode = options?.mode ?? 'population';
  assertVarianceMode(mode, 'options.mode');
  const resolved = resolvePCAOptions(options, 'options');

  const { rowCount, columnCount } = assertRectangularMatrix(data, 'data');

  // variable count === 0이면 즉시 빈 결과 반환. orientation: "columns"의 [[], []]는 rowCount > 0이지만
  // columnCount === 0이라 variable이 없다.
  const earlyVariableCount = orientation === 'columns' ? columnCount : rowCount;
  if (earlyVariableCount === 0) {
    return {
      components: [],
      explainedVariance: [],
      explainedVarianceRatio: [],
      means: [],
      rank: 0,
    };
  }

  const { variables, sampleCount, variableCount } = materializeVariables(data, rowCount, columnCount, orientation);

  if (sampleCount === 0) {
    throw new RangeError(`pca requires sample count >= 1 when variable count > 0, got 0`);
  }
  if (mode === 'sample' && sampleCount < 2) {
    throw new RangeError(`sample pca requires sample count >= 2, got ${sampleCount}`);
  }

  const core = computePcaCore(variables, variableCount, sampleCount, mode, resolved);
  if (core === undefined) {
    return undefined;
  }

  return {
    components: core.components,
    explainedVariance: core.explainedVariance,
    explainedVarianceRatio: core.explainedVarianceRatio,
    means: core.means,
    standardDeviations: core.standardDeviations,
    rank: core.rank,
  };
}
