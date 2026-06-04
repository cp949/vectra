import { resolvePivotEpsilon } from './elimination.internal';
import { performTriangularSubstitution } from './substitution.internal';
import type { MatLike, PivotOptions } from './types';
import { assertFiniteMatrixEntries, extractMatrixShape } from './validate.internal';

/**
 * `[L | b]` augmented matrix에 대해 lower triangular forward substitution을 수행해 해 `x`를
 * 새 `number[]`로 반환한다. singular(diagonal 중 하나라도 abs가 `epsilon` 이하)이면 `undefined`를
 * 반환한다.
 *
 * 마지막 column을 RHS `b`로 보고 앞 `rows`개 column을 coefficient `L`로 본다. row `i = 0..n-1`
 * 순서로 `sum = augmented[i][n] - Σ_{j<i} augmented[i][j] * x[j]`를 누적한 뒤
 * `x[i] = sum / augmented[i][i]`로 결정한다.
 *
 * `augmented`는 rectangular nested array여야 한다. ragged matrix는 `RangeError`.
 * `columns === rows + 1`이어야 한다. 위반 시 `RangeError`(빈 입력 `[]`은 `columns === 0`이라
 * 위반으로 던진다).
 * 모든 entry는 finite number여야 한다. 위반 시 `RangeError`.
 * `options.epsilon`은 0 이상 finite number여야 한다. 미지정 시 default(`1e-9`). 위반 시
 * `RangeError`. epsilon 검증은 다른 input 검증보다 먼저 수행한다.
 * `epsilon`은 diagonal zero 판정과 coefficient 영역의 upper(`column > row`) zero 판정에만 쓰인다.
 * coefficient 영역의 upper에 abs가 `epsilon`보다 큰 entry가 있으면 lower triangular이 아니므로
 * `RangeError`를 던진다.
 * substitution 도중 누적 합 또는 division 결과가 finite number가 아니면 `RangeError`.
 * 결과 entry에는 `-0`이 남지 않는다. 결과는 input 참조를 공유하지 않는 새 `number[]`다.
 *
 * @param augmented `[L | b]` shape의 augmented matrix. 마지막 column이 RHS다.
 * @param options pivot 옵션. `epsilon` 미지정 시 default(`1e-9`).
 */
export function forwardSubstituteAugmentedMatrix(augmented: MatLike, options?: PivotOptions): number[] | undefined {
  const epsilon = resolvePivotEpsilon(options, 'options');
  const shape = extractMatrixShape(augmented, 'augmented');
  const [rows, columns] = shape;
  if (columns !== rows + 1) {
    throw new RangeError(
      `forwardSubstituteAugmentedMatrix requires columns === rows + 1, got shape [${rows}, ${columns}]`
    );
  }
  assertFiniteMatrixEntries(augmented, shape, 'augmented');
  return performTriangularSubstitution(augmented, rows, (r) => augmented[r][rows], epsilon, true, 'augmented');
}
