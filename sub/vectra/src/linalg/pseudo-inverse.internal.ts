import { type ResolvedIterationOptions, resolveIterationOptions } from './jacobi-eigen.internal';
import { computeThinSingularValueDecomposition } from './svd.internal';
import type { IterationOptions, MatLike, MatrixShape, SingularValueDecomposition } from './types';
import { assertFiniteMatrixEntries, extractMatrixShape } from './validate.internal';

/** thin SVD core 호출 결과와 shape를 묶어 caller에 전달한다. */
export interface PseudoInverseSvdContext {
  readonly shape: MatrixShape;
  readonly resolved: ResolvedIterationOptions;
  readonly svd: SingularValueDecomposition;
}

/**
 * pseudo-inverse 계열 leaf의 공통 전처리 단계를 수행한다.
 *
 * 검증 순서: `resolveIterationOptions` → `extractMatrixShape` → `assertFiniteMatrixEntries` →
 * `computeThinSingularValueDecomposition`. Jacobi convergence 실패와 음수 eigenvalue 같은 numeric
 * failure는 `undefined`.
 *
 * caller(`pseudoInverseInto`, `conditionNumber`, `solveUnderdeterminedSystem`)는 이 결과의
 * `svd` rank/singular value/V/U를 그대로 사용한다.
 *
 * @param matrix rectangular finite numeric matrix
 * @param options 반복 옵션. 미지정 시 default.
 */
export function prepareSvdForPseudoInverse(
  matrix: MatLike,
  options: IterationOptions | undefined
): PseudoInverseSvdContext | undefined {
  const resolved = resolveIterationOptions(options, 'options');
  const shape = extractMatrixShape(matrix, 'matrix');
  assertFiniteMatrixEntries(matrix, shape, 'matrix');
  const svd = computeThinSingularValueDecomposition(matrix, shape, resolved);
  if (svd === undefined) {
    return undefined;
  }
  return { shape, resolved, svd };
}

/**
 * thin SVD 결과로 `A^+ = V * diag(1/sigma) * U^T`를 계산해 fresh `n x m` matrix로 반환한다.
 *
 * caller는 `m`, `n` shape와 `svd`를 함께 전달한다. `rank === 0`이면 zero matrix `n x m`을
 * 반환한다. caller가 사전 차단하지 못한 `m === 0 && n === 0`(`extractMatrixShape` 결과상 one-sided
 * zero shape는 미리 reject) 입력은 방어적으로 `[]`를 반환한다.
 *
 * 결과 entry는 `Math.abs <= epsilon` cleanup과 `-0 → +0` canonicalize를 적용한다. 누적 합 /
 * division 결과가 non-finite면 `RangeError`.
 *
 * @param svd thin SVD 결과
 * @param m input row 수
 * @param n input column 수
 * @param epsilon zero cleanup tolerance
 */
export function buildPseudoInverseFromSvd(
  svd: SingularValueDecomposition,
  m: number,
  n: number,
  epsilon: number
): number[][] {
  // 모든 호출자(`pseudoInverseInto`, `solveUnderdeterminedSystem`)는 m === 0 && n === 0 fast path를
  // 사전 차단하므로 이 분기는 방어용이다. extractMatrixShape이 one-sided zero shape를 reject하므로
  // 도달 시 m === 0 ↔ n === 0이 보장된다.
  if (m === 0 && n === 0) {
    return [];
  }
  const { leftSingularVectors, singularValues, rightSingularVectors, rank } = svd;
  const result: number[][] = new Array(n);
  for (let r = 0; r < n; r++) {
    const row = new Array<number>(m);
    for (let c = 0; c < m; c++) {
      row[c] = 0;
    }
    result[r] = row;
  }
  if (rank === 0) {
    return result;
  }
  for (let r = 0; r < n; r++) {
    const vRow = rightSingularVectors[r];
    const resultRow = result[r];
    for (let c = 0; c < m; c++) {
      let sum = 0;
      const uRow = leftSingularVectors[c];
      for (let k = 0; k < rank; k++) {
        const term = (vRow[k] * uRow[k]) / singularValues[k];
        if (!Number.isFinite(term)) {
          throw new RangeError(
            `pseudo-inverse accumulator produced non-finite term at [${r}][${c}], k=${k}, got ${String(term)}`
          );
        }
        sum += term;
        if (!Number.isFinite(sum)) {
          throw new RangeError(`pseudo-inverse accumulator overflowed at [${r}][${c}], k=${k}, got ${String(sum)}`);
        }
      }
      const cleaned = Math.abs(sum) <= epsilon ? 0 : sum;
      resultRow[c] = Object.is(cleaned, -0) ? 0 : cleaned;
    }
  }
  return result;
}

/**
 * `A * x - b`의 max-scaling Euclidean norm을 계산한다.
 *
 * caller가 `A`(`m x n`), `x`(`n`), `b`(`m`)의 finite 검증을 끝낸 뒤 호출한다. 누적 합/곱/sqrt
 * 결과가 non-finite면 `RangeError`.
 *
 * @param a coefficient matrix
 * @param x candidate solution
 * @param b right-hand side vector
 * @param m row 수
 * @param n column 수
 */
export function computeLinearResidualNorm(
  a: MatLike,
  x: readonly number[],
  b: readonly number[],
  m: number,
  n: number
): number {
  if (m === 0) {
    return 0;
  }
  let maxAbs = 0;
  const residuals = new Array<number>(m);
  for (let r = 0; r < m; r++) {
    let sum = 0;
    const row = a[r];
    for (let c = 0; c < n; c++) {
      sum += row[c] * x[c];
      if (!Number.isFinite(sum)) {
        throw new RangeError(`residual accumulator overflowed at row ${r}, got ${String(sum)}`);
      }
    }
    const diff = sum - b[r];
    if (!Number.isFinite(diff)) {
      throw new RangeError(`residual subtraction produced non-finite value at row ${r}, got ${String(diff)}`);
    }
    residuals[r] = diff;
    const abs = Math.abs(diff);
    if (abs > maxAbs) {
      maxAbs = abs;
    }
  }
  if (maxAbs === 0) {
    return 0;
  }
  let sumOfSquares = 0;
  for (let r = 0; r < m; r++) {
    const scaled = residuals[r] / maxAbs;
    sumOfSquares += scaled * scaled;
    if (!Number.isFinite(sumOfSquares)) {
      throw new RangeError(`residual norm accumulator overflowed at row ${r}, got ${String(sumOfSquares)}`);
    }
  }
  const norm = maxAbs * Math.sqrt(sumOfSquares);
  if (!Number.isFinite(norm)) {
    throw new RangeError(`residual norm produced non-finite value, got ${String(norm)}`);
  }
  return norm;
}
