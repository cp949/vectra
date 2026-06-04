import { inverseInto } from './inverse-into';
import type { MatLike, PivotOptions } from './types';

/**
 * square matrix의 inverse를 새 `number[][]`로 반환하거나 singular이면 `undefined`를 반환한다.
 *
 * 내부적으로 `[A | I]` augmented matrix에 partial pivoting Gauss-Jordan elimination(RREF)을
 * 적용한 뒤 right half를 추출한다.
 *
 * `matrix`는 square nested array여야 한다. `rows !== columns`이면 `RangeError`.
 * ragged matrix는 `RangeError`. 모든 entry는 finite number여야 한다. 위반 시 `RangeError`.
 * `options.epsilon`은 0 이상 finite number여야 한다. 미지정 시 default(`1e-9`). 위반 시
 * `RangeError`.
 * `epsilon`은 partial pivoting의 zero pivot 판정과 elimination zero cleanup에만 쓰인다.
 * singular(left half가 identity가 되지 않음)이면 `undefined`를 반환한다.
 * elimination 도중 결과 entry가 finite number가 아니면 `RangeError`.
 * 빈 matrix `[]`(`n = 0`)는 빈 배열 `[]`을 반환한다.
 * 결과는 input row 참조를 공유하지 않는 새 nested array다. inverse 결과 entry에는 `-0`이
 * 남지 않는다.
 *
 *
 * clamp/정규화/fallback 정책은 `inverseInto`와 동일하다.
 * @param matrix inverse를 계산할 square matrix
 * @param options pivot 옵션. `epsilon` 미지정 시 default(`1e-9`).
 */
export function inverse(matrix: MatLike, options?: PivotOptions): number[][] | undefined {
  const n = matrix.length;
  const out: number[][] = new Array(n);
  for (let r = 0; r < n; r++) {
    out[r] = new Array<number>(n);
  }
  return inverseInto(out, matrix, options) ? out : undefined;
}
