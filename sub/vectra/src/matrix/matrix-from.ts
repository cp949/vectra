import type { Matrix, MatrixWritable } from '../types/flat-shapes.internal';
import { copyInto } from './copy-into';
import { createMatrix } from './create-matrix';

/**
 * `Matrix` source의 6개 component를 새 plain object로 복사해 반환한다.
 *
 * @param matrix 복사할 source matrix
 */
export function matrixFrom(matrix: Matrix): MatrixWritable {
  return copyInto(createMatrix(), matrix);
}
