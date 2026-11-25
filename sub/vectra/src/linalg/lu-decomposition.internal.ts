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

  // elimination은 `upper` 한 장에서 진행한다. 대각 아래에는 multiplier를 둔다. 끝나면 multiplier를
  // `lower`로 옮기고 그 자리를 0으로 만든다. L과 U를 따로 둘 뿐 별도 작업 복사본은 만들지 않는다.
  const upper = deepCopyMatrix(matrix, n, n);

  const permutation = new Array<number>(n);
  for (let i = 0; i < n; i++) {
    permutation[i] = i;
  }
  let swaps = 0;

  for (let k = 0; k < n; k++) {
    let maxRow = k;
    let maxAbs = Math.abs(upper[k][k]);
    for (let r = k + 1; r < n; r++) {
      const a = Math.abs(upper[r][k]);
      if (a > maxAbs) {
        maxAbs = a;
        maxRow = r;
      }
    }
    if (maxAbs <= epsilon) {
      return undefined;
    }
    if (maxRow !== k) {
      const tmpRow = upper[k];
      upper[k] = upper[maxRow];
      upper[maxRow] = tmpRow;
      const tmpP = permutation[k];
      permutation[k] = permutation[maxRow];
      permutation[maxRow] = tmpP;
      swaps++;
    }
    const pivot = upper[k][k];
    const pivotRow = upper[k];
    for (let i = k + 1; i < n; i++) {
      const row = upper[i];
      // partial pivoting이라 |row[k]| <= |pivot|이고 |pivot| > epsilon >= 0이므로 |factor| <= 1이다.
      const factor = row[k] / pivot;
      row[k] = factor;
      // factor가 0이면 row[j] - 0 * pivotRow[j]는 row[j]와 같다(pivotRow[j]는 finite다). 0의 부호만
      // 달라질 수 있고, 그 부호는 다른 값에 영향을 주지 않으며 결과를 만들 때 canonicalize한다.
      if (factor === 0) {
        continue;
      }
      for (let j = k + 1; j < n; j++) {
        // |factor| <= 1이라 factor * pivotRow[j]는 finite다.
        const v = row[j] - factor * pivotRow[j];
        if (!Number.isFinite(v)) {
          throw new RangeError(`LU decomposition produced non-finite value at [${i}][${j}], got ${String(v)}`);
        }
        row[j] = v;
      }
    }
  }

  const lower: number[][] = new Array(n);
  for (let i = 0; i < n; i++) {
    const uRow = upper[i];
    const lRow = new Array<number>(n);
    for (let j = 0; j < i; j++) {
      lRow[j] = canonicalizeSignedZero(uRow[j]);
      uRow[j] = 0;
    }
    lRow[i] = 1;
    uRow[i] = canonicalizeSignedZero(uRow[i]);
    for (let j = i + 1; j < n; j++) {
      lRow[j] = 0;
      uRow[j] = canonicalizeSignedZero(uRow[j]);
    }
    lower[i] = lRow;
  }

  return { lower, upper, permutation, swaps };
}
