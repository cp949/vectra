import type { Pose2, Pose2Writable } from '../types/flat-shapes.internal';
import { invertPoseInto } from './invert-pose-into';

/**
 * rigid pose의 inverse transform을 새 plain pose object로 반환한다.
 *
 * `{ px, py, angle }`를 반환한다. 산식은 `angle = -pose.angle`,
 * `position = R(-pose.angle) * (-(pose.px, pose.py))`이다. 결과 pose는 forward transform을 원래
 * frame으로 되돌린다. angle 결과는 normalize하지 않는다. pose translation/angle이
 * non-finite(`NaN`, `Infinity`, `-Infinity`)이면 `RangeError`다.
 *
 * @param pose inverse를 구할 rigid pose
 */
export function invertPose(pose: Pose2): Pose2Writable {
  return invertPoseInto({ px: 0, py: 0, angle: 0 }, pose);
}
