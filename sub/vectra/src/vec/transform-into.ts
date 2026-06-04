import { readMatrixA, readMatrixB, readMatrixC, readMatrixD, readMatrixTx, readMatrixTy } from '../internal/matrix';
import { readX, readY, writeXY } from '../internal/xy';
import type { MatrixLike, XYInput, XYWritable } from '../types';

/**
 * point에 matrix를 적용한 결과를 out에 기록하고 out을 반환한다.
 *
 * translation component tx/ty를 포함한다. input과 out이 같은 object여도 안전하다.
 *
 * @param out 변환된 point를 기록할 writable output
 * @param input 변환할 point
 * @param matrix point에 적용할 matrix
 */
export function transformInto<Out extends XYWritable>(out: Out, input: XYInput, matrix: MatrixLike): Out {
  const x = readX(input);
  const y = readY(input);
  const a = readMatrixA(matrix);
  const b = readMatrixB(matrix);
  const c = readMatrixC(matrix);
  const d = readMatrixD(matrix);
  const tx = readMatrixTx(matrix);
  const ty = readMatrixTy(matrix);
  return writeXY(out, a * x + c * y + tx, b * x + d * y + ty);
}
