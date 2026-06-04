import { writeXY } from '../internal/xy';
import type { MatrixLike, XYWritable } from '../types';
import { decomposeMatrixCore } from './decomposition.internal';

/**
 * matrix에서 skewing component만 추출해 out에 기록하고 out을 반환한다.
 *
 * 같은 helper를 공유하므로 `decomposeInto`와 동일한 oracle을 따른다. 단일 skewX
 * convention에서 `skewing.y`는 항상 `0`이다.
 * - x-basis가 비영이면 `skewing.x = atan2(a·c + b·d, a² + b²)`.
 * - 그 외 분기는 `skewing.x = 0`.
 *
 * 반환되는 angle은 radian이며 `(-π, π]` 범위로 정규화된다. `-0` angle은 `+0`으로 정규화된다.
 *
 * singular matrix와 NaN/Infinity 입력은 검증 없이 JS 산술 결과를 따른다 (caller 책임).
 *
 * @param out skewing을 기록할 writable output
 * @param matrix skewing을 추출할 matrix
 */
export function skewingInto<Out extends XYWritable>(out: Out, matrix: MatrixLike): Out {
  const s = decomposeMatrixCore(matrix);
  return writeXY(out, s.skewingX, s.skewingY);
}
