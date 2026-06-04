import type { MatrixLike, XYInput, XYObjectWritable } from '../types';
import { transformInto } from './transform-into';

/**
 * point에 matrix를 적용한 새 object를 반환한다.
 *
 * translation component tx/ty를 포함한다.
 *
 * @param input 변환할 point
 * @param matrix point에 적용할 matrix
 */
export function transform(input: XYInput, matrix: MatrixLike): XYObjectWritable {
  return transformInto({ x: 0, y: 0 }, input, matrix);
}
