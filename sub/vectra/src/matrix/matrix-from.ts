import type { MatrixLike, MatrixWritable } from '../types';
import { copyInto } from './copy-into';
import { createMatrix } from './create-matrix';

/**
 * `MatrixLike` source의 6개 component를 새 plain object로 복사해 반환한다.
 *
 * @param matrix 복사할 source matrix
 */
export function matrixFrom(matrix: MatrixLike): MatrixWritable;
/**
 * 6개 component로 새 plain matrix writable을 만든다.
 */
export function matrixFrom(a: number, b: number, c: number, d: number, tx: number, ty: number): MatrixWritable;
export function matrixFrom(
  matrixOrA: MatrixLike | number,
  b?: number,
  c?: number,
  d?: number,
  tx?: number,
  ty?: number
): MatrixWritable {
  if (typeof matrixOrA === 'number') {
    return copyInto(createMatrix(), matrixOrA, b as number, c as number, d as number, tx as number, ty as number);
  }
  return copyInto(createMatrix(), matrixOrA);
}
