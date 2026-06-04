import { reducedRowEchelonFormInto } from './reduced-row-echelon-form-into';
import type { MatLike, PivotOptions } from './types';

/**
 * `matrix`의 reduced row echelon form(RREF)을 새 `number[][]`로 반환한다.
 *
 * partial pivoting Gaussian-Jordan elimination을 수행한다. pivot row를 pivot 값으로 나눠 1로
 * normalize하고, pivot column의 위/아래(`r !== pivotRow`) entry를 모두 0으로 제거한다.
 * pivot column 후보 절대값이 `options.epsilon` 이하이면 해당 column에서는 pivot을 선택하지
 * 않고 다음 column으로 이동한다. 결과 `Math.abs(value) <= epsilon`인 entry는 `0`으로 cleanup해
 * `-0`을 남기지 않는다.
 *
 * `matrix`는 rectangular nested array여야 한다. ragged matrix는 `RangeError`. rectangular wide
 * (`rows < columns`)와 tall (`rows > columns`) matrix 모두 지원한다.
 * 모든 entry는 finite number여야 한다. 위반 시 `RangeError`.
 * `options.epsilon`은 0 이상 finite number여야 한다. 미지정 시 default(`1e-9`). 위반 시
 * `RangeError`.
 * elimination 도중 결과 entry가 finite number가 아니면 `RangeError`.
 * 빈 matrix `[]`는 빈 배열 `[]`을 반환한다.
 * 결과는 input row 참조를 공유하지 않는 새 nested array다.
 *
 * @param matrix RREF를 계산할 source matrix
 * @param options pivot 옵션. `epsilon` 미지정 시 default(`1e-9`).
 */
export function reducedRowEchelonForm(matrix: MatLike, options?: PivotOptions): number[][] {
  const rows = matrix.length;
  const firstRow = matrix[0];
  const columns = Array.isArray(firstRow) ? firstRow.length : 0;
  const out: number[][] = new Array(rows);
  for (let r = 0; r < rows; r++) {
    out[r] = new Array(columns);
  }
  return reducedRowEchelonFormInto(out, matrix, options);
}
