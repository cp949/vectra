import type { MatrixWritable } from '../types/flat-shapes.internal';
import { fromArray6Into } from './from-array-6-into';

/**
 * 6-element array에서 matrix component를 읽어 새 object로 반환한다.
 *
 * array 순서: `[a, b, c, d, tx, ty]`.
 * NaN/Infinity 입력은 검증 없이 pass through한다.
 *
 *
 * caller-responsibility 가정은 `fromArray6Into`와 동일하다.
 * @param array 읽을 6-element readonly tuple `[a, b, c, d, tx, ty]`
 */
export function fromArray6(
  array: readonly [a: number, b: number, c: number, d: number, tx: number, ty: number]
): MatrixWritable {
  return fromArray6Into({ a: 0, b: 0, c: 0, d: 0, tx: 0, ty: 0 }, array);
}
