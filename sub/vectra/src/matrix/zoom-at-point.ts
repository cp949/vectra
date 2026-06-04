import type { MatrixLike, MatrixWritable, XYInput } from '../types';
import { zoomAtPointInto } from './zoom-at-point-into';

/**
 * focalPoint를 고정한 채 matrix에 scaleFactor zoom을 합성한 결과를 새 object로 반환한다.
 *
 * focal point는 output coordinate space의 fixed point다. 합성 순서는
 * `T(focalPoint) * S(scaleFactor) * T(-focalPoint) * matrix`이며, 기존 matrix가 focal point에
 * 매핑하던 source point는 zoom 후에도 같은 output focal point에 남는다.
 *
 * `scaleFactor`가 `0` 이하이거나 finite하지 않으면 `RangeError`를 던진다.
 * matrix 또는 focal point component가 finite하지 않으면 `RangeError`를 던진다.
 *
 * @param matrix zoom을 합성할 기존 transform matrix
 * @param focalPoint output coordinate space에서 고정할 focal point
 * @param scaleFactor 양수 zoom scale factor
 */
export function zoomAtPoint(matrix: MatrixLike, focalPoint: XYInput, scaleFactor: number): MatrixWritable {
  return zoomAtPointInto({ a: 0, b: 0, c: 0, d: 0, tx: 0, ty: 0 }, matrix, focalPoint, scaleFactor);
}
