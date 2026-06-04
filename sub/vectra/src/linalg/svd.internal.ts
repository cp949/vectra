import { jacobiSymmetricEigen, type ResolvedIterationOptions } from './jacobi-eigen.internal';
import type { MatLike, MatrixShape, SingularValueDecomposition } from './types';

/**
 * rectangular matrix `A`(`m x n`)의 thin SVD core를 계산한다.
 *
 * caller는 `resolveIterationOptions` + `extractMatrixShape` + `assertFiniteMatrixEntries` 검증을
 * 끝낸 뒤 호출한다. 결과 정책은 `SingularValueDecomposition` 타입 문서와 같으며, public leaf
 * `singularValueDecomposition`와 신규 leaf `columnSpaceInto`가 같은 internal core를 공유한다.
 *
 * 알고리즘:
 *
 *  1. 빈 matrix(`m === 0 || n === 0`)는 `rank = 0` 빈 결과.
 *  2. `A^T * A` `n x n` symmetric matrix를 만든다. 누적 합이 non-finite면 `RangeError`.
 *  3. symmetric Jacobi internal core로 eigenvalue + column matrix eigenvector `V`를 얻는다. 수렴
 *     실패는 `undefined`.
 *  4. eigenvalue `lambda < -epsilon`이면 numeric failure로 `undefined`. `[-epsilon, 0)`은 `0`으로
 *     clamp한다. `sigma = sqrt(clamped)`.
 *  5. `(sigma, column)` pair를 sigma descending으로 정렬한다. `Array.prototype.sort`가 stable이므로
 *     tie-break는 그 결과를 그대로 사용한다.
 *  6. `sigma > epsilon`만 rank에 포함한다.
 *  7. 각 right singular vector `v`는 첫 strict non-zero entry가 양수가 되도록 sign을 고정하고
 *     `-0`을 `+0`으로 canonicalize한다.
 *  8. left singular vector `u = A * v / sigma`. 곱셈/division 결과 non-finite는 `RangeError`.
 *     `Math.abs <= epsilon` cleanup과 `-0` canonicalize를 적용한다.
 *
 * @param matrix rectangular finite numeric matrix
 * @param shape `[m, n]` 이미 검증된 shape
 * @param resolved 검증된 iteration option
 */
export function computeThinSingularValueDecomposition(
  matrix: MatLike,
  shape: MatrixShape,
  resolved: ResolvedIterationOptions
): SingularValueDecomposition | undefined {
  const [m, n] = shape;
  if (m === 0 || n === 0) {
    return { leftSingularVectors: [], singularValues: [], rightSingularVectors: [], rank: 0 };
  }

  const aTa = buildATransposeA(matrix, m, n);

  const jacobi = jacobiSymmetricEigen(aTa, n, resolved);
  if (jacobi === undefined) {
    return undefined;
  }

  const { values, vectors } = jacobi;
  const epsilon = resolved.epsilon;

  type SingularEntry = { sigma: number; column: number };
  const entries: SingularEntry[] = new Array(n);
  for (let i = 0; i < n; i++) {
    const lambda = values[i];
    let clamped: number;
    if (lambda < -epsilon) {
      return undefined;
    } else if (lambda < 0) {
      clamped = 0;
    } else {
      clamped = lambda;
    }
    const sigma = Math.sqrt(clamped);
    if (!Number.isFinite(sigma)) {
      throw new RangeError(`SVD singular value sqrt produced non-finite value at index ${i}, got ${String(sigma)}`);
    }
    entries[i] = { sigma, column: i };
  }

  entries.sort((a, b) => b.sigma - a.sigma);

  let rank = 0;
  for (const e of entries) {
    if (e.sigma > epsilon) {
      rank++;
    } else {
      break;
    }
  }

  if (rank === 0) {
    return { leftSingularVectors: [], singularValues: [], rightSingularVectors: [], rank: 0 };
  }

  const singularValues = new Array<number>(rank);
  const rightSingularVectors: number[][] = new Array(n);
  for (let r = 0; r < n; r++) {
    rightSingularVectors[r] = new Array<number>(rank);
  }
  const leftSingularVectors: number[][] = new Array(m);
  for (let r = 0; r < m; r++) {
    leftSingularVectors[r] = new Array<number>(rank);
  }

  for (let k = 0; k < rank; k++) {
    const sigma = entries[k].sigma;
    const sourceColumn = entries[k].column;
    singularValues[k] = sigma;

    let sign = 1;
    for (let r = 0; r < n; r++) {
      const v = vectors[r][sourceColumn];
      if (v !== 0) {
        sign = v < 0 ? -1 : 1;
        break;
      }
    }

    for (let r = 0; r < n; r++) {
      const v = sign * vectors[r][sourceColumn];
      const cleaned = Math.abs(v) <= epsilon ? 0 : v;
      rightSingularVectors[r][k] = Object.is(cleaned, -0) ? 0 : cleaned;
    }

    for (let r = 0; r < m; r++) {
      let sum = 0;
      const aRow = matrix[r];
      for (let c = 0; c < n; c++) {
        sum += aRow[c] * (sign * vectors[c][sourceColumn]);
        if (!Number.isFinite(sum)) {
          throw new RangeError(
            `SVD left singular vector accumulator overflowed at row ${r}, column index ${k}, got ${String(sum)}`
          );
        }
      }
      const u = sum / sigma;
      if (!Number.isFinite(u)) {
        throw new RangeError(`SVD left singular vector produced non-finite value at [${r}][${k}], got ${String(u)}`);
      }
      const cleaned = Math.abs(u) <= epsilon ? 0 : u;
      leftSingularVectors[r][k] = Object.is(cleaned, -0) ? 0 : cleaned;
    }
  }

  return { leftSingularVectors, singularValues, rightSingularVectors, rank };
}

/**
 * `A^T * A` `n x n` symmetric matrix를 fresh `number[][]`로 만든다.
 *
 * caller가 finite + shape 검증을 끝낸 뒤 호출한다. 누적 합이 non-finite면 `RangeError`.
 */
function buildATransposeA(matrix: MatLike, m: number, n: number): number[][] {
  const result: number[][] = new Array(n);
  for (let i = 0; i < n; i++) {
    const row = new Array<number>(n);
    for (let j = 0; j < n; j++) {
      row[j] = 0;
    }
    result[i] = row;
  }
  for (let i = 0; i < n; i++) {
    for (let j = i; j < n; j++) {
      let sum = 0;
      for (let r = 0; r < m; r++) {
        sum += matrix[r][i] * matrix[r][j];
        if (!Number.isFinite(sum)) {
          throw new RangeError(`SVD A^T A accumulator overflowed at [${i}][${j}], got ${String(sum)}`);
        }
      }
      result[i][j] = sum;
      if (i !== j) {
        result[j][i] = sum;
      }
    }
  }
  return result;
}
