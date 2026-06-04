import type { MatrixLike, XYInput, XYObjectWritable } from '../types';
import { transformVectorInto } from './transform-vector-into';

/**
 * vector에 matrix의 linear part를 적용한 결과를 새 plain vector로 반환한다.
 *
 * translation component tx/ty는 의도적으로 무시한다.
 *
 * @param matrix vector에 적용할 matrix
 * @param vector 변환할 free vector
 */
export function transformVector(matrix: MatrixLike, vector: XYInput): XYObjectWritable {
  return transformVectorInto({ x: 0, y: 0 }, matrix, vector);
}
