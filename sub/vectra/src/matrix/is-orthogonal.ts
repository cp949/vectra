import { readMatrixA, readMatrixB, readMatrixC, readMatrixD } from '../internal/matrix';
import type { MatrixLike } from '../types';

/**
 * matrix의 linear part가 orthogonal하면 true를 반환한다.
 *
 * linear part column vector `(a, b)`와 `(c, d)`의 dot product `a*c + b*d`의 절댓값이 epsilon 이하인지
 * 판정한다. translation `tx`/`ty`는 무시한다. column 길이(scale) 차이는 판정하지 않으므로 non-uniform
 * scale matrix도 column이 수직이면 orthogonal로 본다.
 *
 * epsilon 기본값은 0이므로 기본 호출은 exact orthogonality 판정이다. NaN component가 있으면 dot이 NaN이고
 * `Math.abs(NaN) <= epsilon`이 false이므로 false를 반환한다.
 *
 * @param matrix orthogonality를 확인할 matrix
 * @param epsilon column dot product 절댓값에 적용할 허용 오차
 */
export function isOrthogonal(matrix: MatrixLike, epsilon = 0): boolean {
  const a = readMatrixA(matrix);
  const b = readMatrixB(matrix);
  const c = readMatrixC(matrix);
  const d = readMatrixD(matrix);
  return Math.abs(a * c + b * d) <= epsilon;
}
