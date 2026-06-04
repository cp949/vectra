import { writeXY } from '../internal/xy';
import type { MatrixLike, XYWritable } from '../types';
import { decomposeMatrixCore } from './decomposition.internal';

/**
 * matrix에서 scaling component만 추출해 out에 기록하고 out을 반환한다.
 *
 * 같은 helper를 공유하므로 `decomposeInto`와 동일한 oracle을 따른다.
 * - x-basis가 비영이면 `scaling = (sqrt(a²+b²), (a·d - b·c) / sqrt(a²+b²))`.
 * - primary에 진입하지 않고 y-basis가 비영이면 `scaling = (0, sqrt(c²+d²))`.
 * - 두 분기 비교가 모두 false면 `(0, 0)`.
 *
 * reflection(`det < 0`)은 `scaling.y` 음수로 인코딩된다. `scaling.x`는 항상 비음수다.
 *
 * singular matrix와 NaN/Infinity 입력은 검증 없이 JS 산술 결과를 따른다 (caller 책임).
 *
 * @param out scaling을 기록할 writable output
 * @param matrix scaling을 추출할 matrix
 */
export function decomposeScalingInto<Out extends XYWritable>(out: Out, matrix: MatrixLike): Out {
  const s = decomposeMatrixCore(matrix);
  return writeXY(out, s.scalingX, s.scalingY);
}
