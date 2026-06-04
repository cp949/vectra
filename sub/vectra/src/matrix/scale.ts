import type { MatrixLike, MatrixWritable } from '../types';
import { appendScaleInto } from './append-scale-into';

/**
 * matrix 오른쪽에 S(sx, sy)를 append한 결과(`matrix * S(sx, sy)`)를 새 plain object로 반환한다.
 *
 * 기존 matrix 오른쪽에 scale을 곱해 합성한다. `appendScaleInto`의 allocating companion이다.
 *
 * @param matrix scale을 append할 기준 matrix
 * @param sx 오른쪽에 곱할 x축 scale
 * @param sy 오른쪽에 곱할 y축 scale
 */
export function scale(matrix: MatrixLike, sx: number, sy: number): MatrixWritable {
  return appendScaleInto({ a: 0, b: 0, c: 0, d: 0, tx: 0, ty: 0 }, matrix, sx, sy);
}
