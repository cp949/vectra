import {
  allocateSquareMatrixBuffer,
  assertOrientation,
  assertRectangularMatrix,
  commitRectangularMatrixInto,
  computeCenteredDeltas,
  computeCenteredProductSum,
  computeVariableMean,
  materializeVariables,
} from './matrix.internal';
import { choleskyFactor, forwardSolveLowerTriangular, resolveEpsilon } from './multivariate.internal';
import type { WhiteningOptions } from './types';
import { assertVarianceMode } from './validate.internal';

/**
 * `data`를 ZCA-style 대신 Cholesky 기반 whitening transform한 결과를 `out`에 기록한다.
 *
 * `data`는 row-major `readonly (readonly number[])[]`다. top-level 또는 row가 array가 아니면 `TypeError`.
 * ragged matrix는 `RangeError`. 모든 numeric entry는 finite number여야 한다. 위반은 `RangeError`.
 *
 * `options.orientation` 기본 `"columns"`(row=observation, column=variable). `"rows"`는 row=variable,
 * column=observation. 결과 matrix shape는 입력 orientation을 그대로 유지한다. `"columns"`/`"rows"`가 아니면
 * `RangeError`.
 *
 * `options.mode` 기본 `"population"`(denominator `n`). `"sample"`은 denominator `n - 1`이고 sample count `< 2`에서
 * `RangeError`. mode가 `"population"`/`"sample"`이 아니면 `RangeError`.
 *
 * `options.epsilon`은 Cholesky pivot SPD 판정 tolerance다. 0 이상 finite number가 아니면 `RangeError`. 기본
 * `1e-9`. `epsilon`은 input/result finite validation에 사용하지 않는다(tolerance-split). pivot 후보가 `epsilon`
 * 이하이면 singular/non-SPD covariance로 `RangeError`.
 *
 * 알고리즘: 각 variable의 mean과 centered delta 산출 → covariance matrix `Σ` 산출(`mode`에 따라 denominator
 * 적용) → `Σ = L L^T` Cholesky → 각 observation에 대해 `L z = (x - μ)` forward substitution → `z`를 출력에
 * 기록. `Cov(z) ≈ I`다.
 *
 * variable count가 `0`이면 `out`에 `[]` matrix를 commit하고 반환한다. variable count `> 0` + sample count `0`은
 * `RangeError`(sample 없이는 covariance를 정의할 수 없다).
 *
 * validation 또는 산술 실패 시 `out`은 호출 전 상태 그대로 남는다(모든 산술이 끝난 뒤 단일 commit). `out`과
 * `data`가 같은 nested array여도 안전하다(materialize → commit으로 aliasing 해소). 결과 entry의 `-0`은 `0`으로
 * canonicalize한다. 반환값은 `out`이다.
 *
 * 이 함수는 statistics 자체 Cholesky helper를 사용해 `linalg` cross-domain import를 만들지 않는다.
 *
 * @param out whitening 결과를 기록할 writable matrix. 호출 전 길이는 무시되고 commit 후 입력 orientation과 같은
 *   shape으로 교체된다.
 * @param data whitening할 row-major rectangular finite number matrix. mutate하지 않는다.
 * @param options 옵션. `orientation` 기본 `"columns"`, `mode` 기본 `"population"`, `epsilon` 기본 `1e-9`.
 */
export function whitenInto(
  out: number[][],
  data: readonly (readonly number[])[],
  options?: WhiteningOptions
): number[][] {
  const orientation = options?.orientation ?? 'columns';
  assertOrientation(orientation, 'options.orientation');
  const mode = options?.mode ?? 'population';
  assertVarianceMode(mode, 'options.mode');
  const epsilon = resolveEpsilon(options?.epsilon, 'options.epsilon');

  const { rowCount, columnCount } = assertRectangularMatrix(data, 'data');

  // variable count === 0: 빈 결과 commit. orientation: "columns"에서 [[], []]는 columnCount === 0.
  const earlyVariableCount = orientation === 'columns' ? columnCount : rowCount;
  if (earlyVariableCount === 0) {
    out.length = 0;
    return out;
  }

  const { variables, sampleCount, variableCount } = materializeVariables(data, rowCount, columnCount, orientation);

  if (sampleCount === 0) {
    throw new RangeError(`whiten requires sample count >= 1 when variable count > 0, got 0`);
  }
  if (mode === 'sample' && sampleCount < 2) {
    throw new RangeError(`sample whiten requires sample count >= 2, got ${sampleCount}`);
  }

  // 각 variable의 mean과 centered delta 산출. mean은 centered delta 산출에만 사용되고 별도 저장은 하지 않는다.
  const deltas: number[][] = new Array(variableCount);
  for (let v = 0; v < variableCount; v++) {
    const samples = variables[v];
    const mean = computeVariableMean(samples, v);
    const { deltas: vDeltas } = computeCenteredDeltas(samples, mean, v);
    deltas[v] = vDeltas;
  }

  // covariance matrix(symmetric).
  const denominator = mode === 'sample' ? sampleCount - 1 : sampleCount;
  const cov = allocateSquareMatrixBuffer(variableCount);
  for (let r = 0; r < variableCount; r++) {
    for (let c = r; c < variableCount; c++) {
      const productSum = computeCenteredProductSum(deltas[r], deltas[c], r, c);
      const value = productSum / denominator;
      if (!Number.isFinite(value)) {
        throw new RangeError(`whiten covariance at (${r}, ${c}) must be finite, got ${String(value)}`);
      }
      cov[r][c] = value;
      cov[c][r] = value;
    }
  }

  // Cholesky factorization. SPD 위반은 RangeError로 전파.
  const L = choleskyFactor(cov, variableCount, epsilon);

  // 각 sample s에 대해 delta vector를 만든 뒤 L z = delta forward solve. z[v]는 sample s의 whitened
  // variable v 값이다.
  const outRows = orientation === 'columns' ? sampleCount : variableCount;
  const outCols = orientation === 'columns' ? variableCount : sampleCount;
  const temp: number[][] = new Array(outRows);
  for (let r = 0; r < outRows; r++) temp[r] = new Array<number>(outCols);

  const deltaBuffer = new Array<number>(variableCount);
  for (let s = 0; s < sampleCount; s++) {
    for (let v = 0; v < variableCount; v++) {
      deltaBuffer[v] = deltas[v][s];
    }
    const z = forwardSolveLowerTriangular(L, deltaBuffer, variableCount);
    if (orientation === 'columns') {
      // output[s][v] = z[v]
      for (let v = 0; v < variableCount; v++) temp[s][v] = z[v];
    } else {
      // output[v][s] = z[v]
      for (let v = 0; v < variableCount; v++) temp[v][s] = z[v];
    }
  }

  commitRectangularMatrixInto(out, temp, outRows, outCols);
  return out;
}
