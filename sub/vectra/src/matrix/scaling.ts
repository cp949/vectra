import type { MatrixWritable } from '../types';
import { scalingMatrixInto } from './scaling-matrix-into';

/**
 * identity 기반 scaling-only matrix를 새 plain object로 반환한다.
 *
 * 기존 matrix를 합성하지 않고, 주어진 sx/sy로부터 scaling-only component matrix를 새로 생성한다.
 * `scalingMatrixInto`의 allocating companion이다.
 *
 * @param sx x축 scale
 * @param sy y축 scale
 */
export function scaling(sx: number, sy: number): MatrixWritable {
  return scalingMatrixInto({ a: 0, b: 0, c: 0, d: 0, tx: 0, ty: 0 }, sx, sy);
}
