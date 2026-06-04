import { readMatrixA, readMatrixB, readMatrixC, readMatrixD, readMatrixTx, readMatrixTy } from '../internal/matrix';
import { readX, readY } from '../internal/xy';
import type { MatrixLike, MatrixWritable, XYInput } from '../types';
import { assertFinite } from './viewport.internal';

/**
 * focalPoint를 고정한 채 matrix에 scaleFactor zoom을 합성한 결과를 out에 기록하고 out을 반환한다.
 *
 * focal point는 output coordinate space의 fixed point다. 합성 순서는
 * `T(focalPoint) * S(scaleFactor) * T(-focalPoint) * matrix`이며, 기존 matrix가 focal point에
 * 매핑하던 source point는 zoom 후에도 같은 output focal point에 남는다.
 *
 * `scaleFactor`가 `0` 이하이거나 finite하지 않으면 `RangeError`를 던진다.
 * matrix 또는 focal point component가 finite하지 않으면 `RangeError`를 던진다.
 * 모든 입력 component를 먼저 읽으므로 `out === matrix` aliasing이 안전하다.
 *
 * @param out 합성된 transform matrix를 기록할 writable output
 * @param matrix zoom을 합성할 기존 transform matrix
 * @param focalPoint output coordinate space에서 고정할 focal point
 * @param scaleFactor 양수 zoom scale factor
 */
export function zoomAtPointInto<Out extends MatrixWritable>(
  out: Out,
  matrix: MatrixLike,
  focalPoint: XYInput,
  scaleFactor: number
): Out {
  const a = readMatrixA(matrix);
  const b = readMatrixB(matrix);
  const c = readMatrixC(matrix);
  const d = readMatrixD(matrix);
  const tx = readMatrixTx(matrix);
  const ty = readMatrixTy(matrix);
  const fx = readX(focalPoint);
  const fy = readY(focalPoint);

  assertFinite([a, b, c, d, tx, ty, fx, fy, scaleFactor]);
  if (scaleFactor <= 0) {
    throw new RangeError(`scaleFactor는 양수여야 한다: ${scaleFactor}`);
  }

  out.a = scaleFactor * a;
  out.b = scaleFactor * b;
  out.c = scaleFactor * c;
  out.d = scaleFactor * d;
  out.tx = scaleFactor * tx + fx * (1 - scaleFactor);
  out.ty = scaleFactor * ty + fy * (1 - scaleFactor);
  return out;
}
