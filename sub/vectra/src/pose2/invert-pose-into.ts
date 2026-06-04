import { readPoseAngle, readPosePosition, validatePoseFinite, writeInvertedPose } from '../internal/pose2';
import { readX, readY } from '../internal/xy';
import type { Pose2Like, Pose2Writable, XYWritable } from '../types';

/**
 * rigid pose의 inverse transform을 out에 기록하고 out을 반환한다.
 *
 * 산식은 `angle = -pose.angle`, `position = R(-pose.angle) * (-pose.position)`이다. 결과 pose는
 * forward transform을 원래 frame으로 되돌린다. angle 결과는 normalize하지 않는다. pose
 * translation/angle이 non-finite(`NaN`, `Infinity`, `-Infinity`)이면 `RangeError`다. pose 값을
 * 먼저 모두 읽으므로 `out.position`이 pose position과 같은 object여도 안전하다.
 *
 * @param out inverse 결과를 기록할 writable pose output
 * @param pose inverse를 구할 rigid pose
 */
export function invertPoseInto<Out extends Pose2Writable<XYWritable>>(out: Out, pose: Pose2Like): Out {
  // aliasing 안전 - pose 값을 먼저 모두 읽은 후 기록한다
  const position = readPosePosition(pose);
  const px = readX(position);
  const py = readY(position);
  const angle = readPoseAngle(pose);
  validatePoseFinite(px, py, angle);

  return writeInvertedPose(out, px, py, angle);
}
