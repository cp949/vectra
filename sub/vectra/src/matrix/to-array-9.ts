import type { MatrixLike } from '../types';
import { toArray9Into } from './to-array-9-into';

/**
 * matrix의 6개 component를 column-major 새 mutable 9-element tuple로 반환한다.
 *
 * column-major 순서: `[a, b, 0, c, d, 0, tx, ty, 1]`.
 * 2D affine 마지막 행은 `[0, 0, 1]`로 고정된다.
 * NaN/Infinity component는 검증 없이 pass through한다.
 *
 * @param matrix 읽을 matrix
 */
export function toArray9(matrix: MatrixLike): [number, number, number, number, number, number, number, number, number] {
  return toArray9Into([0, 0, 0, 0, 0, 0, 0, 0, 0], matrix);
}
