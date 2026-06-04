import { readMatrixA, readMatrixB, readMatrixC, readMatrixD, readMatrixTx, readMatrixTy } from '../internal/matrix';
import { readRectHeight, readRectWidth, readRectX, readRectY } from '../internal/rect';
import type { MatrixLike, RectLike, RectWritable } from '../types';

/**
 * rect의 네 corner를 matrix로 변환한 AABB rect를 out에 기록하고 out을 반환한다.
 *
 * empty/degenerate rect도 특별 처리 없이 네 corner를 변환해 axis-aligned rect로 감싼다.
 * input과 out이 같은 object여도 안전하다.
 *
 * @param out 변환된 AABB rect를 기록할 writable output
 * @param matrix rect corner에 적용할 matrix
 * @param rect 변환할 rect
 */
export function transformRectInto<Out extends RectWritable>(out: Out, matrix: MatrixLike, rect: RectLike): Out {
  const a = readMatrixA(matrix);
  const b = readMatrixB(matrix);
  const c = readMatrixC(matrix);
  const d = readMatrixD(matrix);
  const tx = readMatrixTx(matrix);
  const ty = readMatrixTy(matrix);
  // aliasing 안전: rect의 모든 값을 local 변수로 먼저 읽는다
  const x = readRectX(rect);
  const y = readRectY(rect);
  const x2 = x + readRectWidth(rect);
  const y2 = y + readRectHeight(rect);

  // 네 corner를 local scalar로 변환한다
  const x0t = a * x + c * y + tx;
  const y0t = b * x + d * y + ty;
  const x1t = a * x2 + c * y + tx;
  const y1t = b * x2 + d * y + ty;
  const x2t = a * x + c * y2 + tx;
  const y2t = b * x + d * y2 + ty;
  const x3t = a * x2 + c * y2 + tx;
  const y3t = b * x2 + d * y2 + ty;

  const minX = Math.min(x0t, x1t, x2t, x3t);
  const minY = Math.min(y0t, y1t, y2t, y3t);
  const maxX = Math.max(x0t, x1t, x2t, x3t);
  const maxY = Math.max(y0t, y1t, y2t, y3t);

  out.x = minX;
  out.y = minY;
  out.width = maxX - minX;
  out.height = maxY - minY;

  return out;
}
