import type { MatrixLike } from '../types';
import { decomposeMatrixCore } from './decomposition.internal';

/**
 * matrix에서 rotation component만 추출해 radian으로 반환한다.
 *
 * 같은 helper를 공유하므로 `decompose`와 동일한 oracle을 따른다.
 * - x-basis가 비영이면 `rotation = atan2(b, a)`.
 * - primary에 진입하지 않고 y-basis가 비영이면 `rotation = atan2(-c, d)`.
 * - 두 분기 비교가 모두 false면 `0`.
 *
 * 반환값은 `(-π, π]` 범위로 정규화된다. `Math.atan2`가 `-π`를 돌려주면 `π`로,
 * `-0`을 돌려주면 `+0`으로 normalize한다.
 *
 * singular matrix와 NaN/Infinity 입력은 검증 없이 JS 산술 결과를 따른다 (caller 책임).
 *
 * @param matrix rotation을 추출할 matrix
 */
export function rotation(matrix: MatrixLike): number {
  return decomposeMatrixCore(matrix).rotation;
}
