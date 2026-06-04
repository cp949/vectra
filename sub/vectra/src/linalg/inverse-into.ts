import { commitMatrixInto } from './commit-matrix.internal';
import { eliminateRows, resolvePivotEpsilon } from './elimination.internal';
import type { MatLike, MatWritable, PivotOptions } from './types';
import { assertFiniteMatrixEntries, extractMatrixShape } from './validate.internal';

/**
 * square matrix의 inverse를 `out`에 기록하고 성공 여부를 반환하는 boolean-primary `Into`.
 *
 * `[A | I]` augmented matrix에 partial pivoting Gauss-Jordan elimination(RREF)을 적용한 뒤,
 * 결과 left half가 identity인지 확인한다(`temp[i][i] === 1`). 모든 diagonal pivot이 left half에
 * 자리잡으면 right half를 inverse로 추출한다.
 *
 * `matrix`는 square nested array여야 한다. `rows !== columns`이면 `RangeError`.
 * ragged matrix는 `RangeError`. 모든 entry는 finite number여야 한다. 위반 시 `RangeError`.
 * `options.epsilon`은 0 이상 finite number여야 한다. 미지정 시 default(`1e-9`). 위반 시
 * `RangeError`.
 * `epsilon`은 partial pivoting의 zero pivot 판정과 elimination zero cleanup에만 쓰인다.
 * 결과 left half가 identity가 아니면(singular) `false`를 반환하고 `out`은 호출 전 상태 그대로
 * 남는다(commit 단계에 진입하지 않으므로 capacity 검증도 건너뛴다).
 * elimination 도중 결과 entry가 finite number가 아니면 `RangeError`.
 * non-singular인 경우 `out`은 `[n, n]` shape에 맞는 row와 column capacity가 준비되어 있어야 한다.
 * 부족하면 `RangeError`를 던지고 `out`은 수정하지 않는다.
 * 성공 시 `out.length`는 `n`으로, 각 row length는 `n`으로 truncate되고 `true`를 반환한다.
 * 빈 matrix `[]`(`n = 0`)는 `out.length = 0`만 설정하고 `true`를 반환한다.
 * inverse 결과 entry에는 `-0`이 남지 않는다(`v + 0`으로 canonicalize).
 *
 * `out === matrix` aliasing을 허용한다. augmented temp matrix와 별도의 inverse temp에서 결과를
 * 완성한 뒤 commit한다.
 *
 * @param out inverse를 기록할 writable matrix. `[n, n]`에 맞는 capacity가 준비되어 있어야 한다.
 * @param matrix inverse를 계산할 square matrix
 * @param options pivot 옵션. `epsilon` 미지정 시 default(`1e-9`).
 */
export function inverseInto(out: MatWritable, matrix: MatLike, options?: PivotOptions): boolean {
  const epsilon = resolvePivotEpsilon(options, 'options');
  const shape = extractMatrixShape(matrix, 'matrix');
  assertFiniteMatrixEntries(matrix, shape, 'matrix');
  const [rows, columns] = shape;
  if (rows !== columns) {
    throw new RangeError(`inverseInto requires a square matrix, got shape [${rows}, ${columns}]`);
  }
  const n = rows;
  if (n === 0) {
    commitMatrixInto(out, [], 0, 0, 'out');
    return true;
  }
  const augmentedColumns = 2 * n;
  const temp: number[][] = new Array(n);
  for (let r = 0; r < n; r++) {
    const row = new Array<number>(augmentedColumns);
    const src = matrix[r];
    for (let c = 0; c < n; c++) {
      row[c] = src[c];
      row[n + c] = r === c ? 1 : 0;
    }
    temp[r] = row;
  }
  eliminateRows(temp, n, augmentedColumns, epsilon, true);
  for (let i = 0; i < n; i++) {
    if (temp[i][i] !== 1) {
      return false;
    }
  }
  const inv: number[][] = new Array(n);
  for (let r = 0; r < n; r++) {
    const row = new Array<number>(n);
    const src = temp[r];
    for (let c = 0; c < n; c++) {
      const v = src[n + c];
      // -0을 +0으로 canonicalize한다. eliminateRows의 epsilon cleanup이 이미 |v| <= epsilon은
      // +0으로 만들지만, |v| > epsilon인 -0 잔류 가능성을 막기 위한 defensive 처리.
      row[c] = v === 0 ? 0 : v;
    }
    inv[r] = row;
  }
  commitMatrixInto(out, inv, n, n, 'out');
  return true;
}
