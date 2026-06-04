import { writeXY } from '../internal/xy';
import type { MatrixLike, XYWritable } from '../types';
import { decomposeMatrixCore } from './decomposition.internal';

/**
 * matrix에서 translation component만 추출해 out에 기록하고 out을 반환한다.
 *
 * `(out.x, out.y) = (matrix.tx, matrix.ty)`.
 *
 * matrix component에 NaN/Infinity가 있으면 검증하지 않고 JS 산술 결과를 그대로 기록한다
 * (caller 책임). translation 추출은 `tx`/`ty` 값을 그대로 읽으므로 NaN/Infinity 그대로
 * 보존된다.
 *
 * @param out translation을 기록할 writable output
 * @param matrix translation을 추출할 matrix
 */
export function decomposeTranslationInto<Out extends XYWritable>(out: Out, matrix: MatrixLike): Out {
  const s = decomposeMatrixCore(matrix);
  return writeXY(out, s.tx, s.ty);
}
