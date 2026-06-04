import { readBoundsMax, readBoundsMin } from '../internal/bounds';
import { readMatrixA, readMatrixB, readMatrixC, readMatrixD, readMatrixTx, readMatrixTy } from '../internal/matrix';
import { readX, readY, writeXY } from '../internal/xy';
import type { BoundsLike, BoundsWritable, MatrixLike, XYWritable } from '../types';

/**
 * bounds의 네 corner를 matrix로 변환한 AABB를 out에 기록하고 out을 반환한다.
 *
 * empty bounds는 sentinel empty bounds를 기록한다. oriented bounds가 아니라 axis-aligned bounds로
 * 감싼다. input과 out이 같은 object여도 안전하다.
 *
 * @param out 변환된 AABB bounds를 기록할 writable output
 * @param matrix bounds corner에 적용할 matrix
 * @param bounds 변환할 bounds
 */
export function transformBoundsInto<Out extends BoundsWritable<XYWritable, XYWritable>>(
  out: Out,
  matrix: MatrixLike,
  bounds: BoundsLike
): Out {
  const a = readMatrixA(matrix);
  const b = readMatrixB(matrix);
  const c = readMatrixC(matrix);
  const d = readMatrixD(matrix);
  const tx = readMatrixTx(matrix);
  const ty = readMatrixTy(matrix);
  // aliasing 안전: bounds의 모든 값을 local 변수로 먼저 읽는다
  const minX = readX(readBoundsMin(bounds));
  const minY = readY(readBoundsMin(bounds));
  const maxX = readX(readBoundsMax(bounds));
  const maxY = readY(readBoundsMax(bounds));

  // empty sentinel pass-through: isEmpty 조건에서 empty sentinel을 그대로 기록한다
  if (maxX < minX || maxY < minY) {
    writeXY(out.min, Infinity, Infinity);
    writeXY(out.max, -Infinity, -Infinity);
    return out;
  }

  // 네 corner를 local scalar로 변환한다
  const x0t = a * minX + c * minY + tx;
  const y0t = b * minX + d * minY + ty;
  const x1t = a * maxX + c * minY + tx;
  const y1t = b * maxX + d * minY + ty;
  const x2t = a * minX + c * maxY + tx;
  const y2t = b * minX + d * maxY + ty;
  const x3t = a * maxX + c * maxY + tx;
  const y3t = b * maxX + d * maxY + ty;

  writeXY(out.min, Math.min(x0t, x1t, x2t, x3t), Math.min(y0t, y1t, y2t, y3t));
  writeXY(out.max, Math.max(x0t, x1t, x2t, x3t), Math.max(y0t, y1t, y2t, y3t));

  return out;
}
