import type { MatrixWritable } from '../../../src/types';

export function makeMatrix(): MatrixWritable {
  return { a: 0, b: 0, c: 0, d: 0, tx: 0, ty: 0 };
}
