/**
 * flat number 배열의 각 좌표에 2D affine transform matrix를 적용하여 새 배열을 반환한다.
 *
 * transformFlatCoordsInto의 allocating convenience 함수다.
 */

import type { MatrixLike } from '../../types/index';
import { transformFlatCoordsInto } from './transform-flat-coords-into';

/**
 * `[x0, y0, x1, y1, ...]` 형태의 flat 좌표 배열에 matrix를 적용하여 새 배열을 반환한다.
 *
 * - 새 number[] 배열을 할당하여 반환한다.
 * - buffer 재사용이 필요하면 {@link transformFlatCoordsInto}를 사용한다.
 *
 *
 * caller-responsibility 가정은 `transformFlatCoordsInto`와 동일하다.
 * @param flat - `[x0, y0, x1, y1, ...]` 형태의 flat 좌표 number 배열
 * @param matrix - 적용할 2D affine transform matrix
 * @returns matrix가 적용된 `[x0, y0, x1, y1, ...]` 형태의 number 배열
 */
export function transformFlatCoords(flat: readonly number[], matrix: MatrixLike): number[] {
  const out: number[] = new Array(flat.length);
  transformFlatCoordsInto(out, flat, matrix);
  return out;
}
