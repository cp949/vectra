import type { MatrixLike } from '../types';
import { toArray6Into } from './to-array-6-into';

/**
 * matrix의 6개 component를 새 mutable 6-element tuple로 반환한다.
 *
 * 기록 순서: `[a, b, c, d, tx, ty]`. MatrixTuple과 동일한 순서이다.
 * NaN/Infinity component는 검증 없이 pass through한다.
 *
 * @param matrix 읽을 matrix
 */
export function toArray6(matrix: MatrixLike): [number, number, number, number, number, number] {
  return toArray6Into([0, 0, 0, 0, 0, 0], matrix);
}
