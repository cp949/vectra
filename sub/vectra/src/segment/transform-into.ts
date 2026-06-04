import { readMatrixA, readMatrixB, readMatrixC, readMatrixD, readMatrixTx, readMatrixTy } from '../internal/matrix';
import { readSegmentA, readSegmentB } from '../internal/segment';
import { readX, readY, writeXY } from '../internal/xy';
import type { MatrixLike, SegmentLike, SegmentWritable, XYWritable } from '../types';

/**
 * segment의 두 endpoint에 matrix transform을 적용한 결과를 out에 기록하고 out을 반환한다. input/output aliasing 허용.
 *
 * @param out 결과를 기록할 writable segment output
 * @param line 변환할 segment
 * @param matrix 적용할 matrix
 */
export function transformInto<Out extends SegmentWritable<XYWritable, XYWritable>>(
  out: Out,
  line: SegmentLike,
  matrix: MatrixLike
): Out {
  // aliasing 안전: 모든 좌표와 matrix component를 먼저 읽는다
  const ax = readX(readSegmentA(line));
  const ay = readY(readSegmentA(line));
  const bx = readX(readSegmentB(line));
  const by = readY(readSegmentB(line));
  const a = readMatrixA(matrix);
  const b = readMatrixB(matrix);
  const c = readMatrixC(matrix);
  const d = readMatrixD(matrix);
  const tx = readMatrixTx(matrix);
  const ty = readMatrixTy(matrix);
  writeXY(out.a, a * ax + c * ay + tx, b * ax + d * ay + ty);
  writeXY(out.b, a * bx + c * by + tx, b * bx + d * by + ty);
  return out;
}
