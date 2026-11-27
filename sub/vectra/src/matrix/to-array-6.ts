import type { Matrix } from '../types/flat-shapes.internal';
import { toArray6Into } from './to-array-6-into';

/**
 * matrix의 6개 component를 새 mutable 6-element tuple로 반환한다.
 *
 * 기록 순서: `[a, b, c, d, tx, ty]`.
 * NaN/Infinity component는 검증 없이 pass through한다.
 *
 * @param matrix 읽을 matrix
 */
export function toArray6(matrix: Matrix): [number, number, number, number, number, number] {
  return toArray6Into([0, 0, 0, 0, 0, 0], matrix);
}
