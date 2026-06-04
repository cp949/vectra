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
 * `data`의 covariance matrix를 `out`에 기록한다.
 *
 * `data`는 row-major `readonly (readonly number[])[]`다. top-level 또는 row가 array가 아니면
 * `TypeError`. ragged matrix는 `RangeError`. 모든 entry는 finite number여야 한다. 위반 시
 * `RangeError`. `options.orientation` 기본 `"columns"`. `"columns"`는 row=observation,
 * column=variable. `"rows"`는 row=variable, column=observation. `"columns"`/`"rows"`가 아니면
 * `RangeError`. `options.mode` 기본 `"population"`. denominator 정책은 `VarianceOptions`와 같다.
 * `mode`가 `"population"`/`"sample"`이 아니면 `RangeError`. variable count가 `0`이면 `[]` matrix를
 * commit하고 반환한다. variable count가 `> 0`인데 sample count가 `0`이면 `RangeError`.
 * `mode: "sample"`에서 sample count가 `< 2`이면 `RangeError`. 누적 sum, centered delta, centered
 * product, product sum, 나눗셈 결과 중 하나라도 non-finite면 `RangeError`. 결과는 square symmetric
 * matrix이고 diagonal은 각 variable의 variance다. 결과 entry의 `-0`은 `0`으로 canonicalize한다.
 * validation 또는 산술 실패 시 `out`은 호출 전 상태를 유지한다(모든 산술이 끝난 뒤 commit). `out`과
 * `data`가 같은 nested array여도 안전하다(commit 단계에서 fresh row 배열로 교체).
 * 반환값은 `out`이다.
 *
 * @param out covariance matrix를 기록할 writable storage. 호출 전 길이는 무시되고 commit 후 결과
 *   matrix로 교체된다.
 * @param data covariance matrix를 계산할 matrix. row-major rectangular finite number matrix.
 * @param options 옵션. `orientation` 기본 `"columns"`, `mode` 기본 `"population"`.
 */
export function covarianceMatrixInto(
  out: number[][],
  data: readonly (readonly number[])[],
  options?: CovarianceMatrixOptions
): number[][] {
  const orientation = options?.orientation ?? 'columns';
  assertOrientation(orientation, 'options.orientation');
  const mode = options?.mode ?? 'population';
  assertVarianceMode(mode, 'options.mode');

  const { rowCount, columnCount } = assertRectangularMatrix(data, 'data');

  // variable count === 0이면 즉시 빈 matrix commit. orientation: "columns"의 [[], []]는
  // rowCount > 0이지만 columnCount === 0이라 variable이 없다.
  const earlyVariableCount = orientation === 'columns' ? columnCount : rowCount;
  if (earlyVariableCount === 0) {
    out.length = 0;
    return out;
  }

  const { variables, sampleCount, variableCount } = materializeVariables(data, rowCount, columnCount, orientation);

  if (sampleCount === 0) {
    throw new RangeError(`covarianceMatrix requires sample count >= 1 when variable count > 0, got 0`);
  }
  if (mode === 'sample' && sampleCount < 2) {
    throw new RangeError(`sample covarianceMatrix requires sample count >= 2, got ${sampleCount}`);
  }

  const deltas: number[][] = new Array(variableCount);
  for (let v = 0; v < variableCount; v++) {
    const samples = variables[v];
    const mean = computeVariableMean(samples, v);
    const { deltas: vDeltas } = computeCenteredDeltas(samples, mean, v);
    deltas[v] = vDeltas;
  }

  const denominator = mode === 'sample' ? sampleCount - 1 : sampleCount;
  const temp = allocateSquareMatrixBuffer(variableCount);
  for (let r = 0; r < variableCount; r++) {
    for (let c = r; c < variableCount; c++) {
      const productSum = computeCenteredProductSum(deltas[r], deltas[c], r, c);
      const value = productSum / denominator;
      if (!Number.isFinite(value)) {
        throw new RangeError(`covariance at (${r}, ${c}) must be finite, got ${String(value)}`);
      }
      temp[r][c] = value;
      temp[c][r] = value;
    }
  }

  commitSymmetricMatrixInto(out, temp, variableCount);
  return out;
}
