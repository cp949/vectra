import { powInto } from './pow-into';
import type { MatLike } from './types';

/**
 * square matrix를 integer `exponent` 만큼 거듭제곱한 결과 `matrix^exponent`를 새 `number[][]`로 반환한다.
 *
 * `matrix`는 square rectangular nested array여야 한다. `rows !== columns`이면 `RangeError`.
 * ragged matrix 또는 non-finite entry는 `RangeError`.
 * `exponent`는 `Number.isSafeInteger(exponent)`를 만족해야 한다. NaN, Infinity, 비정수,
 * safe integer 범위 밖은 `RangeError`.
 * `exponent === 0`은 identity matrix를 반환한다. 빈 matrix `[]`는 `[]`을 반환한다.
 * `exponent === 1`은 deep copy를 반환한다.
 * `exponent > 1`은 exponentiation by squaring으로 계산하며 모든 intermediate 곱셈 결과 entry가
 * finite number여야 한다. 위반 시 `RangeError`.
 * `exponent < 0`은 먼저 `matrix`의 inverse를 partial pivoting Gauss-Jordan elimination으로
 * 계산하고 `|exponent|` 만큼 거듭제곱한다. singular matrix는 `RangeError`.
 * 결과는 input row 참조를 공유하지 않는 새 nested array다. 결과 entry에는 `-0`이 남지 않는다.
 *
 * @param matrix 거듭제곱할 square matrix
 * @param exponent 거듭제곱 지수. safe integer만 허용한다.
 */
export function pow(matrix: MatLike, exponent: number): number[][] {
  const n = matrix.length;
  const out: number[][] = new Array(n);
  for (let r = 0; r < n; r++) {
    out[r] = new Array<number>(n);
  }
  return powInto(out, matrix, exponent);
}
