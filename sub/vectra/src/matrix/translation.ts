import type { MatrixWritable, XYInput } from '../types';
import { translationMatrixInto } from './translation-matrix-into';

/**
 * identity 기반 translation-only matrix를 새 plain object로 반환한다.
 *
 * 기존 matrix를 합성하지 않고, offset으로부터 translation-only component matrix를 새로 생성한다.
 * `translationMatrixInto`의 allocating companion이다.
 *
 * @param offset matrix의 tx/ty로 기록할 translation offset
 */
export function translation(offset: XYInput): MatrixWritable {
  return translationMatrixInto({ a: 0, b: 0, c: 0, d: 0, tx: 0, ty: 0 }, offset);
}
