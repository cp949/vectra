import { writeXY } from '../internal/xy';
import type { MatrixDecompositionWritable, MatrixLike, XYWritable } from '../types';
import { decomposeMatrixCore } from './decomposition.internal';

/**
 * matrix를 translation / rotation / scaling / skewing으로 분해해 out에 기록하고 out을 반환한다.
 *
 * 분해식: `M = T(translation) · R(rotation) · S(scaling) · K(skewing.x)`. 단일 skewX
 * convention에서 `K = [[1, tan(skewing.x)], [0, 1]]`이고 `skewing.y`는 항상 `0`이다.
 *
 * 분기 정책:
 * - x-basis가 비영(`a² + b² > 0`)이면 x-basis 기준 분해.
 * - primary에 진입하지 않고 y-basis가 비영이면 `scaling.x = 0`, rotation은 y-basis에서 추출.
 * - 두 분기 비교가 모두 false면 rotation/scaling/skewing 모두 0.
 *
 * 반환되는 angle은 radian이며 `(-π, π]` 범위로 정규화된다. `Math.atan2`가 `-π`를 돌려주면
 * `π`로, `-0`을 돌려주면 `+0`으로 normalize한다.
 *
 * reflection(`det < 0`)은 `scaling.y` 음수로 인코딩된다. `scaling.x`는 `sqrt(a²+b²)`이므로
 * 항상 비음수다.
 *
 * singular matrix(`det === 0`)는 별도 에러를 던지지 않고 위 분기 결과를 기록한다.
 * matrix component에 NaN/Infinity가 있으면 검증하지 않는다. 분기 비교와 각 분기 안의 산술은
 * JS 결과를 따른다 (caller 책임).
 *
 * out은 nested writable이다. `out.translation`, `out.scaling`, `out.skewing`은 호출 전에
 * `XYWritable` 인스턴스로 초기화되어 있어야 한다.
 *
 * @param out 분해 결과를 기록할 nested writable output
 * @param matrix 분해할 matrix
 */
export function decomposeInto<Out extends MatrixDecompositionWritable<XYWritable, XYWritable, XYWritable>>(
  out: Out,
  matrix: MatrixLike
): Out {
  const s = decomposeMatrixCore(matrix);
  writeXY(out.translation, s.tx, s.ty);
  writeXY(out.scaling, s.scalingX, s.scalingY);
  writeXY(out.skewing, s.skewingX, s.skewingY);
  out.rotation = s.rotation;
  return out;
}
