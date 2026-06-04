import type { MatrixDecompositionWritable, MatrixWritable, XYWritable } from '../types';
import { matrixComposeInto } from './matrix-compose-into';

/**
 * decomposition component를 합성한 matrix를 새 plain object로 반환한다. `decompose`의 역연산이다.
 *
 * 합성식: `M = T(translation) · R(rotation) · S(scaling) · K(skewing.x)`. 단일 skewX
 * convention에서 `K = [[1, tan(skewing.x)], [0, 1]]`이다.
 *
 * 단일 skewX convention이라 `skewing.y`는 합성식에 사용하지 않는다. caller는 `skewing.y`를 `0`으로
 * 둔다. `0`이 아니어도 검증/사용 없이 무시한다.
 *
 * non-finite component는 검증하지 않는다. `Math.cos`/`Math.sin`/`Math.tan`과 JS 산술 결과를 그대로
 * 기록한다 (caller 책임).
 *
 * @param decomposition 합성할 translation/rotation/scaling/skewing component
 */
export function matrixCompose(
  decomposition: MatrixDecompositionWritable<XYWritable, XYWritable, XYWritable>
): MatrixWritable {
  return matrixComposeInto({ a: 0, b: 0, c: 0, d: 0, tx: 0, ty: 0 }, decomposition);
}
