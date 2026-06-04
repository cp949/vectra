import type { MatrixWritable } from '../types';
import { identityInto } from './identity-into';

/**
 * identity matrix를 새 plain object로 반환한다.
 *
 * 인자를 받지 않는다. `identityInto`의 allocating companion이다.
 */
export function identity(): MatrixWritable {
  return identityInto({ a: 0, b: 0, c: 0, d: 0, tx: 0, ty: 0 });
}
