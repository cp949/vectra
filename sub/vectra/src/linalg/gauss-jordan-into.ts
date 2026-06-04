import { reducedRowEchelonFormInto } from './reduced-row-echelon-form-into';
import type { MatLike, MatWritable, PivotOptions } from './types';

/**
 * `matrix`의 Gauss-Jordan elimination 결과를 `out`에 기록한다.
 *
 * `reducedRowEchelonFormInto`의 canonical alias다. 같은 partial pivoting RREF 결과를 반환하며
 * pivot row normalize, pivot column 위/아래 entry 제거, epsilon zero cleanup 정책을 모두
 * 동일하게 따른다.
 *
 * `matrix`는 rectangular nested array여야 한다. ragged matrix는 `RangeError`.
 * 모든 entry는 finite number여야 한다. 위반 시 `RangeError`.
 * `options.epsilon`은 0 이상 finite number여야 한다. 미지정 시 default(`1e-9`). 위반 시
 * `RangeError`.
 * elimination 도중 결과 entry가 finite number가 아니면 `RangeError`.
 * `out`은 `matrix`와 같은 shape에 맞는 row와 column capacity가 준비되어 있어야 한다. 부족하면
 * `RangeError`.
 * 위 조건 중 하나라도 위반하면 `out`은 호출 전 상태 그대로 남는다.
 *
 * `out === matrix` aliasing을 허용한다. temp matrix에서 결과를 만든 뒤 commit한다.
 *
 * @param out 결과를 기록할 writable matrix. `matrix`와 같은 shape에 맞는 capacity가 준비되어
 *            있어야 한다.
 * @param matrix Gauss-Jordan elimination을 적용할 source matrix
 * @param options pivot 옵션. `epsilon` 미지정 시 default(`1e-9`).
 */
export function gaussJordanInto<Out extends MatWritable>(out: Out, matrix: MatLike, options?: PivotOptions): Out {
  return reducedRowEchelonFormInto(out, matrix, options);
}
