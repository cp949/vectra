import type { MatrixLike, XYObjectWritable } from '../types';
import { decomposeTranslationInto } from './decompose-translation-into';

/**
 * matrix에서 translation component만 추출해 새 plain `{ x, y }`로 반환한다.
 *
 * `(x, y) = (matrix.tx, matrix.ty)`.
 *
 * matrix component에 NaN/Infinity가 있으면 검증하지 않고 JS 산술 결과를 그대로 반환한다
 * (caller 책임).
 *
 * @param matrix translation을 추출할 matrix
 */
export function decomposeTranslation(matrix: MatrixLike): XYObjectWritable {
  return decomposeTranslationInto({ x: 0, y: 0 }, matrix);
}
