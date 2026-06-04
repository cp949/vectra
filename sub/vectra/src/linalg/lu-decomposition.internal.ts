import { deepCopyMatrix } from './elimination.internal';
import type { LUFactorization, MatLike } from './types';

/** `-0`을 `+0`으로 canonicalize한다. `v === 0`은 `-0`과 `+0` 모두에서 true다. */
function canonicalizeSignedZero(v: number): number {
  return v === 0 ? 0 : v;
}

/**
 * 검증된 `n x n` finite square matrix에 partial pivoting Doolittle LU factorization을 수행한다.
 *
 * caller가 다음을 이미 보장한다:
 *  - `matrix`는 rectangular nested array이고 모든 entry가 finite number다.
 *  - `n === matrix.length === matrix[0]?.length`.
 *  - `epsilon`은 0 이상 finite number다.
 *
 * empty matrix(`n === 0`)는 비어있는 LUFactorization(`{ lower: [], upper: [], permutation: [],
 * swaps: 0 }`)을 반환한다. 최대 절대값 pivot이 `epsilon` 이하이면 singular로 보고 `undefined`를
 * 반환한다. multiplier/차감 결과가 non-finite면 `RangeError`. 결과 entry의 `-0`은 `+0`으로
 * canonicalize한다.
 *
 * @param matrix 검증된 finite square matrix
 * @param n 한 변 길이
 * @param epsilon pivot zero 판정 tolerance
 */
export function decomposeFiniteSquareMatrixLU(
  matrix: MatLike,
  n: number,
  epsilon: number
): LUFactorization | undefined {
  if (n === 0) {
    return { lower: [], upper: [], permutation: [], swaps: 0 };
  }

  const temp = deepCopyMatrix(matrix, n, n);

  const permutation = new Array<number>(n);
  for (let i = 0; i < n; i++) {
    permutation[i] = i;
  }
  let swaps = 0;

  for (let k = 0; k < n; k++) {
    let maxRow = k;
    let maxAbs = Math.abs(temp[k][k]);
    for (let r = k + 1; r < n; r++) {
      const a = Math.abs(temp[r][k]);
      if (a > maxAbs) {
        maxAbs = a;
        maxRow = r;
      }
    }
    if (maxAbs <= epsilon) {
      return undefined;
    }
    if (maxRow !== k) {
      const tmpRow = temp[k];
      temp[k] = temp[maxRow];
      temp[maxRow] = tmpRow;
      const tmpP = permutation[k];
      permutation[k] = permutation[maxRow];
      permutation[maxRow] = tmpP;
      swaps++;
    }
    const pivot = temp[k][k];
    const pivotRow = temp[k];
    for (let i = k + 1; i < n; i++) {
      const row = temp[i];
      const factor = row[k] / pivot;
      if (!Number.isFinite(factor)) {
        throw new RangeError(`LU decomposition produced non-finite multiplier at [${i}][${k}], got ${String(factor)}`);
      }
      row[k] = factor;
      for (let j = k + 1; j < n; j++) {
        const term = factor * pivotRow[j];
        // safety net. partial pivoting하에서 |factor| <= 1이라 |term| <= |pivotRow[j]| finite.
        // pivoting 정책이 바뀌면 silent NaN 대신 RangeError로 막는다.
        if (!Number.isFinite(term)) {
          throw new RangeError(
            `LU decomposition produced non-finite intermediate at [${i}][${j}], got ${String(term)}`
          );
        }
        const v = row[j] - term;
        if (!Number.isFinite(v)) {
          throw new RangeError(`LU decomposition produced non-finite value at [${i}][${j}], got ${String(v)}`);
        }
        row[j] = v;
      }
    }
  }

  const lower: number[][] = new Array(n);
  const upper: number[][] = new Array(n);
  for (let i = 0; i < n; i++) {
    const tempRow = temp[i];
    const lRow = new Array<number>(n);
    const uRow = new Array<number>(n);
    for (let j = 0; j < n; j++) {
      if (j < i) {
        lRow[j] = canonicalizeSignedZero(tempRow[j]);
        uRow[j] = 0;
      } else if (j === i) {
        lRow[j] = 1;
        uRow[j] = canonicalizeSignedZero(tempRow[j]);
      } else {
        lRow[j] = 0;
        uRow[j] = canonicalizeSignedZero(tempRow[j]);
      }
    }
    lower[i] = lRow;
    upper[i] = uRow;
  }

  return { lower, upper, permutation, swaps };
}
