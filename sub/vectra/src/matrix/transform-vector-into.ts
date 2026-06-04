import { readMatrixA, readMatrixB, readMatrixC, readMatrixD } from '../internal/matrix';
import { readX, readY, writeXY } from '../internal/xy';
import type { MatrixLike, XYInput, XYWritable } from '../types';

/**
 * vector에 matrix의 linear part를 적용한 결과를 out에 기록하고 out을 반환한다.
 *
 * translation component tx/ty는 의도적으로 무시한다. direction, normal, velocity 같은 free vector에
 * 사용한다. input과 out이 같은 object여도 안전하다.
 *
 * @param out 변환된 vector를 기록할 writable output
 * @param matrix vector에 적용할 matrix
 * @param vector 변환할 free vector
 */
export function transformVectorInto<Out extends XYWritable>(out: Out, matrix: MatrixLike, vector: XYInput): Out {
  const a = readMatrixA(matrix);
  const b = readMatrixB(matrix);
  const c = readMatrixC(matrix);
  const d = readMatrixD(matrix);
  // aliasing 안전: input x/y를 먼저 읽은 뒤 out에 기록한다
  const x = readX(vector);
  const y = readY(vector);
  // translation tx/ty를 의도적으로 제외한다 — direction/normal/velocity 같은 free vector에 사용
  return writeXY(out, a * x + c * y, b * x + d * y);
}
