import { nullSpaceInto } from './null-space-into';
import type { IterationOptions, MatLike } from './types';

/**
 * `A * x = 0`의 RREF canonical nullspace basis를 새 `number[][]`로 반환한다.
 *
 * basis 정책과 검증 순서는 `nullSpaceInto`와 동일하다. 새 `number[][]`를 seed로 만들어
 * `nullSpaceInto`에 위임하므로 결과는 row 참조를 공유하지 않는 fresh storage다.
 *
 * full column rank이면 `[]`. zero matrix이면 column 수만큼의 standard basis row vector를 반환한다.
 * 빈 matrix `[]`는 `[]`.
 *
 * `matrix`는 rectangular nested array여야 한다. ragged matrix와 one-sided zero shape `[[]]`는
 * `RangeError`. 모든 entry는 finite number여야 한다. 위반 시 `RangeError`.
 * `options.maxIterations`/`options.tolerance`/`options.epsilon` 검증 정책은 `nullSpaceInto`와 같다.
 *
 * @param matrix nullspace를 계산할 source matrix
 * @param options 반복 옵션. 미지정 시 default(`maxIterations=100`, `tolerance=1e-10`, `epsilon=1e-9`).
 */
export function nullSpace(matrix: MatLike, options?: IterationOptions): number[][] {
  // seed는 RREF 결과를 모르므로 worst-case(columns 길이의 row를 column 수만큼)로 준비한다.
  // zero matrix면 모든 column이 free라 columns개 basis vector가 필요하다.
  const rows = matrix.length;
  const firstRow = matrix[0];
  const columns = Array.isArray(firstRow) ? firstRow.length : 0;
  const capacity = rows === 0 ? 0 : columns;
  const seed: number[][] = new Array(capacity);
  for (let i = 0; i < capacity; i++) {
    seed[i] = new Array<number>(columns);
  }
  return nullSpaceInto(seed, matrix, options);
}
