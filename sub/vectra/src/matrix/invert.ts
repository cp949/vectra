import type { MatrixLike, MatrixWritable } from '../types';
import { createMatrix } from './create-matrix';
import { invertInto } from './invert-into';

/**
 * matrix의 inverse를 새 plain matrix로 반환한다.
 *
 * determinant === 0이면 undefined를 반환한다. determinant 판정은 exact check이며 epsilon은
 * 적용하지 않는다.
 *
 * @param matrix inverse를 계산할 matrix
 */
export function invert(matrix: MatrixLike): MatrixWritable | undefined {
  const out = createMatrix();
  return invertInto(out, matrix) ? out : undefined;
}
