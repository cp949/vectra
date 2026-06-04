import type { MatrixLike, MatrixWritable } from '../types';
import { appendRotateInto } from './append-rotate-into';

/**
 * matrix 오른쪽에 R(angle)을 append한 결과(`matrix * R(angle)`)를 새 plain object로 반환한다.
 *
 * 기존 matrix 오른쪽에 rotation을 곱해 합성한다. angle은 radian이다.
 * `appendRotateInto`의 allocating companion이다.
 *
 * @param matrix rotation을 append할 기준 matrix
 * @param angle 오른쪽에 곱할 rotation angle (radian)
 */
export function rotate(matrix: MatrixLike, angle: number): MatrixWritable {
  return appendRotateInto({ a: 0, b: 0, c: 0, d: 0, tx: 0, ty: 0 }, matrix, angle);
}
