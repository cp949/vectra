import type { MatrixWritable } from '../types';
import { fromArray9Into } from './from-array-9-into';

/**
 * column-major 9-element array에서 matrix component를 읽어 새 object로 반환한다.
 *
 * column-major 순서: `[a, b, 0, c, d, 0, tx, ty, 1]`.
 * 2D affine 마지막 행 `[0, 0, 1]`을 가정한다. index 2, 5, 8은 무시한다.
 * NaN/Infinity 입력은 검증 없이 pass through한다.
 *
 * @param array 읽을 column-major 9-element readonly tuple
 */
export function fromArray9(
  array: readonly [number, number, number, number, number, number, number, number, number]
): MatrixWritable {
  return fromArray9Into({ a: 0, b: 0, c: 0, d: 0, tx: 0, ty: 0 }, array);
}
