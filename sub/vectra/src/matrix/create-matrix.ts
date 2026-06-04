import type { MatrixWritable } from '../types';

/**
 * identity matrix writable을 새로 만든다.
 *
 * 인자를 받지 않는다. `MatrixLike`를 새 plain object로 복사하려면 `matrixFrom`을 사용한다.
 */
export function createMatrix(): MatrixWritable {
  return { a: 1, b: 0, c: 0, d: 1, tx: 0, ty: 0 };
}
