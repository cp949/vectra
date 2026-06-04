import type { MatrixLike, MatrixWritable, XYInput } from '../types';
import { appendTranslateInto } from './append-translate-into';

/**
 * matrix 오른쪽에 T(offset)을 append한 결과(`matrix * T(offset)`)를 새 plain object로 반환한다.
 *
 * 기존 matrix 오른쪽에 translation을 곱해 합성한다. `appendTranslateInto`의 allocating companion이다.
 *
 * @param matrix translation을 append할 기준 matrix
 * @param offset 오른쪽에 곱할 translation offset
 */
export function translate(matrix: MatrixLike, offset: XYInput): MatrixWritable {
  return appendTranslateInto({ a: 0, b: 0, c: 0, d: 0, tx: 0, ty: 0 }, matrix, offset);
}
