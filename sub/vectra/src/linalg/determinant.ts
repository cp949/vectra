import { deepCopyMatrix, eliminateRows, resolvePivotEpsilon } from './elimination.internal';
import type { MatLike, PivotOptions } from './types';
import { assertFiniteMatrixEntries, extractMatrixShape } from './validate.internal';

/**
 * square matrix의 determinant를 반환한다.
 *
 * partial pivoting Gaussian elimination을 REF 형태로 수행한 뒤, diagonal entry product에
 * row swap 횟수의 패리티를 곱해 determinant를 계산한다(`Π temp[i][i] * (-1)^swaps`).
 *
 * `matrix`는 square nested array여야 한다. `rows !== columns`이면 `RangeError`.
 * ragged matrix는 `RangeError`. 모든 entry는 finite number여야 한다. 위반 시 `RangeError`.
 * `options.epsilon`은 0 이상 finite number여야 한다. 미지정 시 default(`1e-9`). 위반 시
 * `RangeError`.
 * `epsilon`은 partial pivoting의 zero pivot 판정과 elimination 결과 entry zero cleanup에 쓰인다.
 * input/result finite validation에는 사용하지 않는다. pivot 후보 절대값이 `epsilon` 이하인
 * column이 하나라도 있으면 해당 행렬은 singular로 보고 `0`을 반환한다.
 * 빈 matrix `[]`는 empty product identity로 `1`을 반환한다.
 * elimination 도중 결과 entry가 finite number가 아니면 `RangeError`.
 * 누적 diagonal product가 `Infinity`로 overflow되면 `RangeError`(개별 entry가 finite여도
 * 누적 곱은 overflow될 수 있다).
 * singular 결과는 항상 `+0`이며 `-0`이 남지 않는다.
 *
 * @param matrix determinant를 계산할 square matrix
 * @param options pivot 옵션. `epsilon` 미지정 시 default(`1e-9`).
 */
export function determinant(matrix: MatLike, options?: PivotOptions): number {
  const epsilon = resolvePivotEpsilon(options, 'options');
  const shape = extractMatrixShape(matrix, 'matrix');
  assertFiniteMatrixEntries(matrix, shape, 'matrix');
  const [rows, columns] = shape;
  if (rows !== columns) {
    throw new RangeError(`determinant requires a square matrix, got shape [${rows}, ${columns}]`);
  }
  const n = rows;
  if (n === 0) {
    return 1;
  }
  const temp = deepCopyMatrix(matrix, n, n);
  const { rank, swaps } = eliminateRows(temp, n, n, epsilon, false);
  if (rank < n) {
    return 0;
  }
  let product = 1;
  for (let i = 0; i < n; i++) {
    product *= temp[i][i];
    if (!Number.isFinite(product)) {
      throw new RangeError(`determinant diagonal product overflow at index ${i}, got ${String(product)}`);
    }
  }
  if (product === 0) {
    return 0;
  }
  return (swaps & 1) === 1 ? -product : product;
}
