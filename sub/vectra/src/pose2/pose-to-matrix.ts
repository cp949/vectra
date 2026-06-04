import type { MatrixWritable, Pose2Like } from '../types';
import { poseToMatrixInto } from './pose-to-matrix-into';

/**
 * rigid pose를 affine transform matrix로 변환해 새 plain matrix object로 반환한다.
 *
 * `{ a: cos, b: sin, c: -sin, d: cos, tx: px, ty: py }`를 반환한다(angle은 radian). 결과 matrix로
 * point를 변환하면 `transformPointByPose(pose, point)`와 같은 좌표를 낸다. pose translation/angle이
 * non-finite(`NaN`, `Infinity`, `-Infinity`)이면 `RangeError`다.
 *
 * @param pose matrix로 변환할 rigid pose
 */
export function poseToMatrix(pose: Pose2Like): MatrixWritable {
  return poseToMatrixInto({ a: 1, b: 0, c: 0, d: 1, tx: 0, ty: 0 }, pose);
}
