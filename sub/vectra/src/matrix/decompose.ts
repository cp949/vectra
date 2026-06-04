import type { MatrixLike, XYObjectWritable } from '../types';
import { decomposeInto } from './decompose-into';

/**
 * matrix를 translation / rotation / scaling / skewing으로 분해해 새 plain object로 반환한다.
 *
 * 분해식: `M = T(translation) · R(rotation) · S(scaling) · K(skewing.x)`. 단일 skewX
 * convention에서 `skewing.y`는 항상 `0`이다.
 *
 * 분기 정책:
 * - x-basis가 비영(`a² + b² > 0`)이면 x-basis 기준 분해.
 * - primary에 진입하지 않고 y-basis가 비영이면 `scaling.x = 0`, rotation은 y-basis에서 추출.
 * - 두 분기 비교가 모두 false면 rotation/scaling/skewing 모두 0.
 *
 * 반환되는 angle은 radian이며 `(-π, π]` 범위로 정규화된다. `-0` angle은 `+0`으로 정규화된다.
 * reflection(`det < 0`)은 `scaling.y` 음수로 인코딩된다.
 *
 * singular matrix와 NaN/Infinity 입력은 검증 없이 JS 산술 결과를 따른다 (caller 책임).
 *
 * @param matrix 분해할 matrix
 */
export function decompose(matrix: MatrixLike): {
  translation: XYObjectWritable;
  scaling: XYObjectWritable;
  skewing: XYObjectWritable;
  rotation: number;
} {
  return decomposeInto(
    {
      translation: { x: 0, y: 0 },
      scaling: { x: 0, y: 0 },
      skewing: { x: 0, y: 0 },
      rotation: 0,
    },
    matrix
  );
}
