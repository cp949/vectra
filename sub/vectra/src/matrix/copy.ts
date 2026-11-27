import type { Matrix, MatrixWritable } from '../types/flat-shapes.internal';
import { copyInto } from './copy-into';

/**
 * `Matrix` source의 6개 component를 새 plain object로 복사해 반환한다.
 *
 * 기능은 `matrixFrom`과 같다. companion 명명 일관성을 위해 `copyInto`의
 * allocating companion으로 제공한다.
 *
 * @param source 복사할 source matrix
 */
export function copy(source: Matrix): MatrixWritable {
  return copyInto({ a: 0, b: 0, c: 0, d: 0, tx: 0, ty: 0 }, source);
}
