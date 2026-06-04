import { commitMatrixInto } from './commit-matrix.internal';
import { deepCopyMatrix } from './elimination.internal';
import { resolveIterationOptions } from './jacobi-eigen.internal';
import { buildRrefNullSpaceBasis, computeRrefPivotInfo } from './subspace.internal';
import type { IterationOptions, MatLike, MatWritable } from './types';
import { assertFiniteMatrixEntries, extractMatrixShape } from './validate.internal';

/**
 * `A * x = 0`의 RREF canonical nullspace basis를 `out`에 기록한다.
 *
 * partial pivoting RREF의 free column마다 길이 `n`(column 수)의 basis vector 하나를 만든다.
 * basis vector `v_f`는 다음과 같다.
 *
 *  - `v_f[f] = 1`.
 *  - 각 pivot column `pc`의 row `pr`에 대해 `v_f[pc] = -RREF[pr][f]`.
 *  - 그 외 free column entry는 `0`.
 *
 * 결과 entry는 `Math.abs <= options.epsilon`이면 `0`으로 cleanup하고 `-0`은 `+0`으로 canonicalize한다.
 * basis는 normalize하지 않는다(RREF canonical coefficient 보존).
 *
 * full column rank이면 `out.length = 0`. zero matrix이면 column 수만큼의 standard basis row vector를
 * 기록한다.
 *
 * 검증 순서: `resolveIterationOptions` → `extractMatrixShape(matrix)` → `assertFiniteMatrixEntries`
 * → basis 계산 → `out` capacity 검증 → commit. 어느 단계 실패도 `out`을 호출 전 상태 그대로 둔다.
 *
 * `matrix`는 rectangular nested array여야 한다. ragged matrix와 one-sided zero shape `[[]]`는
 * `RangeError`. 모든 entry는 finite number여야 한다. 위반 시 `RangeError`.
 * `options.maxIterations`는 positive safe integer, `options.tolerance`와 `options.epsilon`은 0 이상
 * finite number여야 한다. 위반 시 `RangeError`. `tolerance`는 이 함수에서 직접 사용하지 않지만
 * API 쌍과 옵션 타입을 일관되게 유지하기 위해 검증만 수행한다. `epsilon`은 RREF pivot zero
 * 판정과 zero cleanup에만 사용한다. input/result finite validation에는 사용하지 않는다.
 * 빈 matrix `[]`는 `out.length = 0`만 설정한다.
 *
 * `out`은 basis 개수만큼의 row capacity와 각 row에 `n` column capacity가 준비되어 있어야 한다.
 * 부족하면 `RangeError`. 성공 시 `out.length`는 basis 개수, 각 row length는 `n`으로 truncate된다.
 *
 * @param out basis를 기록할 writable matrix. 실패 시 수정되지 않는다.
 * @param matrix nullspace를 계산할 source matrix
 * @param options 반복 옵션. 미지정 시 default(`maxIterations=100`, `tolerance=1e-10`, `epsilon=1e-9`).
 */
export function nullSpaceInto<Out extends MatWritable>(out: Out, matrix: MatLike, options?: IterationOptions): Out {
  const resolved = resolveIterationOptions(options, 'options');
  const shape = extractMatrixShape(matrix, 'matrix');
  assertFiniteMatrixEntries(matrix, shape, 'matrix');
  const [rows, columns] = shape;
  if (rows === 0) {
    out.length = 0;
    return out;
  }
  const temp = deepCopyMatrix(matrix, rows, columns);
  const info = computeRrefPivotInfo(temp, rows, columns, resolved.epsilon);
  const basis = buildRrefNullSpaceBasis(temp, columns, info, resolved.epsilon);
  commitMatrixInto(out, basis, basis.length, columns, 'out');
  return out;
}
