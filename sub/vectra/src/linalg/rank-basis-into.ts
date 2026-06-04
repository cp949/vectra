import { commitMatrixInto } from './commit-matrix.internal';
import { deepCopyMatrix } from './elimination.internal';
import { resolveIterationOptions } from './jacobi-eigen.internal';
import { computeRrefPivotInfo } from './subspace.internal';
import type { IterationOptions, MatLike, MatWritable } from './types';
import { assertFiniteMatrixEntries, extractMatrixShape } from './validate.internal';

/**
 * `A`(`m x n`)의 RREF pivot column에 대응하는 원본 column을 row-vector basis로 `out`에 기록한다.
 *
 * partial pivoting RREF에서 pivot이 잡힌 column index를 ascending으로 모은 뒤, 원본 matrix의
 * 그 column들을 그대로 복사해 basis row로 사용한다. `columnSpace*`와 달리 orthonormal로 변환하지
 * 않고 원본 column을 보존한다.
 *
 * basis row 개수는 RREF rank이며 각 row 길이는 `m`(row 수)이다. rank 0이면 `out.length = 0`.
 * 빈 matrix `[]`도 `out.length = 0`. 결과 entry의 `-0`은 `+0`으로 canonicalize한다.
 *
 * 검증 순서: `resolveIterationOptions` → `extractMatrixShape(matrix)` → `assertFiniteMatrixEntries`
 * → RREF + pivot 추출 → `out` capacity 검증 → commit. 어느 단계 실패도 `out`을 호출 전 상태 그대로
 * 둔다.
 *
 * `matrix`는 rectangular nested array여야 한다. ragged matrix와 one-sided zero shape `[[]]`는
 * `RangeError`. 모든 entry는 finite number여야 한다. 위반 시 `RangeError`.
 * `options.maxIterations`는 positive safe integer, `options.tolerance`와 `options.epsilon`은 0 이상
 * finite number여야 한다. 위반 시 `RangeError`. `tolerance`는 이 함수에서 직접 사용하지 않지만
 * API 쌍과 옵션 타입을 일관되게 유지하기 위해 검증만 수행한다. `epsilon`은 RREF pivot zero
 * 판정과 zero cleanup에만 사용한다. input/result finite validation에는 사용하지 않는다.
 *
 * `out`은 rank 만큼의 row capacity와 각 row에 `m` column capacity가 준비되어 있어야 한다.
 * 부족하면 `RangeError`. 성공 시 `out.length`는 rank, 각 row length는 `m`으로 truncate된다.
 *
 * @param out basis를 기록할 writable matrix. 실패 시 수정되지 않는다.
 * @param matrix rank basis를 계산할 source matrix
 * @param options 반복 옵션. 미지정 시 default(`maxIterations=100`, `tolerance=1e-10`, `epsilon=1e-9`).
 */
export function rankBasisInto<Out extends MatWritable>(out: Out, matrix: MatLike, options?: IterationOptions): Out {
  const resolved = resolveIterationOptions(options, 'options');
  const shape = extractMatrixShape(matrix, 'matrix');
  assertFiniteMatrixEntries(matrix, shape, 'matrix');
  const [rows, columns] = shape;
  if (rows === 0) {
    out.length = 0;
    return out;
  }
  const temp = deepCopyMatrix(matrix, rows, columns);
  const { pivotColumns } = computeRrefPivotInfo(temp, rows, columns, resolved.epsilon);
  const basis: number[][] = new Array(pivotColumns.length);
  for (let i = 0; i < pivotColumns.length; i++) {
    const pc = pivotColumns[i];
    const vector = new Array<number>(rows);
    for (let r = 0; r < rows; r++) {
      const value = matrix[r][pc];
      vector[r] = Object.is(value, -0) ? 0 : value;
    }
    basis[i] = vector;
  }
  commitMatrixInto(out, basis, basis.length, rows, 'out');
  return out;
}
