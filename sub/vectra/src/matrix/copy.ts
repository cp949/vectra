import type { MatrixLike, MatrixWritable } from '../types';
import { copyInto } from './copy-into';

/**
 * `MatrixLike` source의 6개 component를 새 plain object로 복사해 반환한다.
 *
 * 기능은 `matrixFrom`과 같다. companion 명명 일관성을 위해 `copyInto`의
 * allocating companion으로 제공한다.
 *
 * @param source 복사할 source matrix
 */
export function copy(source: MatrixLike): MatrixWritable;
/**
 * 6개 component로 새 plain matrix writable을 만든다.
 */
export function copy(a: number, b: number, c: number, d: number, tx: number, ty: number): MatrixWritable;
export function copy(
  matrixOrA: MatrixLike | number,
  b?: number,
  c?: number,
  d?: number,
  tx?: number,
  ty?: number
): MatrixWritable {
  if (typeof matrixOrA === 'number') {
    return copyInto(
      { a: 0, b: 0, c: 0, d: 0, tx: 0, ty: 0 },
      matrixOrA,
      b as number,
      c as number,
      d as number,
      tx as number,
      ty as number
    );
  }
  return copyInto({ a: 0, b: 0, c: 0, d: 0, tx: 0, ty: 0 }, matrixOrA);
}
