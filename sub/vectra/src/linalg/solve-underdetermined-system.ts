import { resolveIterationOptions } from './jacobi-eigen.internal';
import { buildPseudoInverseFromSvd, computeLinearResidualNorm } from './pseudo-inverse.internal';
import { computeThinSingularValueDecomposition } from './svd.internal';
import type { IterationOptions, MatLike, VecLike } from './types';
import {
  assertFiniteMatrixEntries,
  assertFiniteVector,
  assertVectorLength,
  extractMatrixShape,
} from './validate.internal';

/**
 * underdetermined linear system `A * x = b`(`A.rows < A.columns`)의 minimum-norm exact solution을 반환한다.
 *
 * 계산:
 *
 *  1. thin SVD로 `A^+`를 구한 뒤 candidate `x = A^+ * b`를 계산한다.
 *  2. residual `||A * x - b||₂`를 max-scaling으로 계산한다.
 *  3. residual이 `epsilon`보다 크면 inconsistent로 보고 `undefined`를 반환한다.
 *  4. 그렇지 않으면 `x`를 반환한다. minimum-norm property는 `A^+` 정의로 자동 만족된다.
 *
 * 검증 순서: `resolveIterationOptions` → `extractMatrixShape(A)` → `A=[]` fast path(`extractMatrixShape`
 * 직후 분기, `assertVectorLength(b, 0)` 후 즉시 `[]` 반환) → `A.rows < A.columns` 분기 →
 * `assertVectorLength(b, rows)` → `assertFiniteMatrixEntries(A)` → `assertFiniteVector(b)` →
 * SVD 계산 → residual 분기.
 *
 * `A.rows === b.length`를 요구한다. 위반은 `RangeError`.
 * `A.rows >= A.columns`이면 underdetermined 정의를 만족하지 않으므로 `RangeError`. square/tall은
 * 기존 `solveByGaussianElimination` / factorization solve가 담당한다.
 * `A=[]`, `b=[]`는 unknown count 0인 empty solution `[]`을 반환한다.
 * `A`/`b`의 모든 entry는 finite number여야 한다. NaN/Infinity는 `RangeError`.
 * `options.maxIterations`는 positive safe integer, `options.tolerance`와 `options.epsilon`은 0 이상
 * finite number여야 한다. 위반 시 `RangeError`. `tolerance`는 Jacobi convergence 판정에, `epsilon`은
 * SVD sigma rank 판정 / pseudo-inverse zero cleanup / candidate `x` zero cleanup / residual
 * exactness 판정에만 사용한다. input/result finite validation에는 사용하지 않는다.
 *
 * Jacobi convergence 실패와 음수 eigenvalue 같은 numeric failure는 `undefined`. pseudo-inverse 또는
 * residual 계산 중 누적 합/division 결과가 non-finite면 `RangeError`. 결과 entry의 `-0`은 `+0`으로
 * canonicalize한다.
 *
 * @param A coefficient matrix. `A.rows < A.columns`.
 * @param b right-hand side vector. `b.length === A.rows`.
 * @param options 반복 옵션. 미지정 시 default(`maxIterations=100`, `tolerance=1e-10`, `epsilon=1e-9`).
 */
export function solveUnderdeterminedSystem(A: MatLike, b: VecLike, options?: IterationOptions): number[] | undefined {
  const resolved = resolveIterationOptions(options, 'options');
  const shape = extractMatrixShape(A, 'A');
  const [m, n] = shape;
  // 빈 matrix는 unknown count 0인 unique empty solution. A.rows < A.columns 제약을 우회한다.
  if (m === 0 && n === 0) {
    assertVectorLength(b, 0, 'b');
    return [];
  }
  if (m >= n) {
    throw new RangeError(
      `solveUnderdeterminedSystem requires A.rows < A.columns (wide system), got shape [${m}, ${n}]`
    );
  }
  assertVectorLength(b, m, 'b');
  assertFiniteMatrixEntries(A, shape, 'A');
  assertFiniteVector(b, 'b');

  const svd = computeThinSingularValueDecomposition(A, shape, resolved);
  if (svd === undefined) {
    return undefined;
  }

  // x = A^+ * b. A^+는 n x m, b는 m, x는 n.
  const pseudoInverse = buildPseudoInverseFromSvd(svd, m, n, resolved.epsilon);
  const x = new Array<number>(n);
  for (let r = 0; r < n; r++) {
    let sum = 0;
    const row = pseudoInverse[r];
    for (let c = 0; c < m; c++) {
      sum += row[c] * b[c];
      if (!Number.isFinite(sum)) {
        throw new RangeError(
          `solveUnderdeterminedSystem candidate accumulator overflowed at row ${r}, got ${String(sum)}`
        );
      }
    }
    const cleaned = Math.abs(sum) <= resolved.epsilon ? 0 : sum;
    x[r] = Object.is(cleaned, -0) ? 0 : cleaned;
  }

  const residual = computeLinearResidualNorm(A, x, b, m, n);
  if (residual > resolved.epsilon) {
    return undefined;
  }
  return x;
}
