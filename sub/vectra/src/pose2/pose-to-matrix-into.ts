import { readPoseAngle, readPosePosition, validatePoseFinite } from '../internal/pose2';
import { readX, readY } from '../internal/xy';
import type { MatrixWritable, Pose2Like } from '../types';

/**
 * rigid pose를 affine transform matrix component로 out에 기록하고 out을 반환한다.
 *
 * `matrix` domain의 component convention에 맞춰 `{ a: cos, b: sin, c: -sin, d: cos, tx: px,
 * ty: py }`를 기록한다(angle은 radian). 결과 matrix로 point를 변환하면
 * `transformPointByPose(pose, point)`와 같은 좌표를 낸다. pose translation/angle이
 * non-finite(`NaN`, `Infinity`, `-Infinity`)이면 `RangeError`다. 검증을 통과한 angle에서는
 * `Math.cos`/`Math.sin` 결과가 항상 finite이므로 matrix component도 finite다.
 *
 * @param out matrix component를 기록할 writable output
 * @param pose matrix로 변환할 rigid pose
 */
export function poseToMatrixInto<Out extends MatrixWritable>(out: Out, pose: Pose2Like): Out {
  const position = readPosePosition(pose);
  const px = readX(position);
  const py = readY(position);
  const angle = readPoseAngle(pose);
  validatePoseFinite(px, py, angle);

  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  out.a = cos;
  out.b = sin;
  out.c = -sin;
  out.d = cos;
  out.tx = px;
  out.ty = py;
  return out;
}
