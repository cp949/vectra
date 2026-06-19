import { type JacobiSymmetricEigenRawResult, jacobiSymmetricEigenRaw } from '../internal/jacobi-symmetric-eigen';
import type { ResolvedIterationOptions } from './jacobi-eigen-options.internal';

/** Jacobi 결과. 수렴하지 못한 경우 `undefined`. */
export interface JacobiEigenResult {
  /** symmetric matrix의 eigenvalue diagonal. Jacobi 결과 순서를 그대로 보존한다. */
  readonly values: number[];

  /** column matrix 형태의 eigenvector. `vectors[row][i]`가 `values[i]`에 대응하는 entry. */
  readonly vectors: number[][];
}

/**
 * symmetric square matrix `A`(`n x n`)에 cyclic Jacobi rotation을 적용해 eigenvalue diagonal과
 * column matrix 형태의 eigenvector를 계산한다.
 *
 * caller는 다음 전제를 보장해야 한다.
 *
 * - `matrix`는 rectangular, square, finite, symmetric(`|a[i][j] - a[j][i]| <= epsilon`) matrix다.
 * - `n >= 1`. empty / 1x1은 caller가 분기 처리한다.
 *
 * 알고리즘:
 *
 *  1. `A`의 deep copy를 working storage로 사용한다(`A` mutate 금지).
 *  2. `V = I_n`로 시작한다.
 *  3. iteration마다 strict upper-triangular(`p < q`) 영역에서 abs max인 `(p, q)`를 찾는다.
 *  4. max abs가 `tolerance` 이하면 수렴으로 보고 종료한다.
 *  5. 그렇지 않으면 `A[p][q]`를 0으로 만드는 Givens rotation parameter `(c, s)`를 계산해 `A`의
 *     `p`/`q` row + column과 `V`의 `p`/`q` column에 적용한다.
 *  6. `maxIterations` 안에 수렴하지 못하면 `undefined`.
 *
 * Givens rotation은 numerically stable formula를 쓴다(`theta = (Aqq - App) / (2 * Apq)`,
 * `t = sign(theta) / (|theta| + sqrt(theta^2 + 1))`). `maxAbs > tolerance >= 0`이라 step에 들어가는
 * 시점에 `Apq != 0`이 보장된다. 누적 합 / 곱 / sqrt 결과가 non-finite면 `RangeError`. 결과 entry는
 * `Math.abs(value) <= epsilon`이면 `0`으로 cleanup하고 `-0`은 `+0`으로 canonicalize한다.
 *
 * @param matrix symmetric finite square matrix
 * @param n matrix 크기. `>= 1`.
 * @param resolved 검증된 iteration option
 */
export function jacobiSymmetricEigen(
  matrix: readonly (readonly number[])[],
  n: number,
  resolved: ResolvedIterationOptions
): JacobiEigenResult | undefined {
  const { maxIterations, tolerance, epsilon } = resolved;
  const raw = jacobiSymmetricEigenRaw(matrix, n, {
    maxIterations,
    tolerance,
    errorPrefix: 'Jacobi rotation',
  });
  return raw === undefined ? undefined : finalize(raw, n, epsilon);
}

/**
 * Jacobi loop가 수렴 판정에 도달한 뒤 diagonal과 eigenvector matrix를 정리해 `JacobiEigenResult`를
 * 만든다. zero cleanup과 `-0` canonicalize를 values와 vectors entry 양쪽에 적용한다.
 *
 * vectors의 column sign convention(첫 strict non-zero entry 양수)은 여기서 강제하지 않는다.
 * caller가 결과 용도에 맞게 별도 helper(예: `applyColumnSignConvention`)로 적용한다.
 */
function finalize(raw: JacobiSymmetricEigenRawResult, n: number, epsilon: number): JacobiEigenResult {
  const values = new Array<number>(n);
  for (let i = 0; i < n; i++) {
    const v = raw.values[i];
    const cleaned = Math.abs(v) <= epsilon ? 0 : v;
    values[i] = Object.is(cleaned, -0) ? 0 : cleaned;
  }
  const vectors = raw.vectors;
  for (let r = 0; r < n; r++) {
    const row = vectors[r];
    for (let c = 0; c < n; c++) {
      const v = row[c];
      const cleaned = Math.abs(v) <= epsilon ? 0 : v;
      row[c] = Object.is(cleaned, -0) ? 0 : cleaned;
    }
  }
  return { values, vectors };
}

/**
 * column-orthonormal vector matrix `V`(`n x k`)의 column별 sign convention과 zero cleanup을 적용한다.
 *
 * 각 column에 대해 첫 strict non-zero entry가 양수가 되도록 sign을 뒤집고, `Math.abs <= epsilon`은
 * `0`으로 cleanup하고 `-0`은 `+0`으로 canonicalize한다. `V`는 in-place로 수정된다.
 *
 * caller는 `V.length === n`, 각 row 길이 `>= k` 를 보장한다.
 */
export function applyColumnSignConvention(vectors: number[][], n: number, k: number, epsilon: number): void {
  for (let col = 0; col < k; col++) {
    let sign = 1;
    for (let r = 0; r < n; r++) {
      const v = vectors[r][col];
      if (v !== 0) {
        sign = v < 0 ? -1 : 1;
        break;
      }
    }
    for (let r = 0; r < n; r++) {
      const v = sign * vectors[r][col];
      const cleaned = Math.abs(v) <= epsilon ? 0 : v;
      vectors[r][col] = Object.is(cleaned, -0) ? 0 : cleaned;
    }
  }
}

/**
 * symmetric matrix 여부를 `|a[i][j] - a[j][i]| <= epsilon`으로 판정한다.
 *
 * caller가 square + finite 검증을 끝낸 뒤 호출한다. 위반 위치를 찾으면 즉시 `false`.
 *
 * @param matrix 검사할 square matrix
 * @param n matrix 크기
 * @param epsilon symmetry tolerance
 */
export function isSymmetricFiniteMatrix(matrix: readonly (readonly number[])[], n: number, epsilon: number): boolean {
  for (let i = 0; i < n; i++) {
    const rowI = matrix[i];
    for (let j = i + 1; j < n; j++) {
      if (Math.abs(rowI[j] - matrix[j][i]) > epsilon) {
        return false;
      }
    }
  }
  return true;
}

/**
 * 2x2 finite matrix `[[a, b], [c, d]]`의 real eigenvalue 쌍을 closed form으로 계산한다.
 *
 * 결과 분기:
 *
 *  - discriminant `(a - d)^2 + 4 * b * c`가 `< -epsilon`이면 complex pair로 보고 `undefined`.
 *  - `[-epsilon, 0)`은 repeated real eigenvalue로 보고 `0`으로 clamp한다.
 *  - 그 외 양수 discriminant는 `sqrt(D)`를 그대로 사용한다.
 *
 * 누적 합 / 곱 / sqrt 결과가 non-finite면 `RangeError`. 결과 entry는 `Math.abs <= epsilon`이면 `0`,
 * `-0`은 `+0`으로 canonicalize한다.
 *
 * 결과 순서는 `(trace + sqrtD) / 2, (trace - sqrtD) / 2`다. 즉 첫 번째 값이 더 크거나 같다.
 *
 * @param matrix 2x2 finite square matrix
 * @param epsilon discriminant clamp / zero cleanup tolerance
 */
export function twoByTwoRealEigenvalues(
  matrix: readonly (readonly number[])[],
  epsilon: number
): [number, number] | undefined {
  const a = matrix[0][0];
  const b = matrix[0][1];
  const c = matrix[1][0];
  const d = matrix[1][1];

  const trace = a + d;
  const traceSquared = trace * trace;
  const detTimesFour = 4 * (a * d - b * c);
  const discriminant = traceSquared - detTimesFour;
  if (!Number.isFinite(discriminant)) {
    throw new RangeError(
      `2x2 eigenvalue discriminant overflowed for matrix [[${a}, ${b}], [${c}, ${d}]], got ${String(discriminant)}`
    );
  }

  let clampedD: number;
  if (-discriminant > epsilon) {
    return undefined;
  } else if (discriminant <= 0) {
    clampedD = 0;
  } else {
    clampedD = discriminant;
  }

  const sqrtD = Math.sqrt(clampedD);
  if (!Number.isFinite(sqrtD)) {
    throw new RangeError(`2x2 eigenvalue sqrt produced non-finite value, got ${String(sqrtD)}`);
  }

  const e1Raw = (trace + sqrtD) / 2;
  const e2Raw = (trace - sqrtD) / 2;
  if (!Number.isFinite(e1Raw) || !Number.isFinite(e2Raw)) {
    throw new RangeError(
      `2x2 eigenvalue computation produced non-finite result, got (${String(e1Raw)}, ${String(e2Raw)})`
    );
  }
  const e1 = cleanupZero(e1Raw, epsilon);
  const e2 = cleanupZero(e2Raw, epsilon);
  return [e1, e2];
}

function cleanupZero(value: number, epsilon: number): number {
  const cleaned = Math.abs(value) <= epsilon ? 0 : value;
  return Object.is(cleaned, -0) ? 0 : cleaned;
}
