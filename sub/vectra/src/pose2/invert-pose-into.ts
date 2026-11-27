import { validatePoseFinite, writeInvertedPose } from '../internal/pose2';
import type { Pose2, Pose2Writable } from '../types/flat-shapes.internal';

/**
 * rigid pose의 inverse transform을 out에 기록하고 out을 반환한다.
 *
 * 산식은 `angle = -pose.angle`, `position = R(-pose.angle) * (-(pose.px, pose.py))`이다. 결과 pose는
 * forward transform을 원래 frame으로 되돌린다. angle 결과는 normalize하지 않는다. pose
 * translation/angle이 non-finite(`NaN`, `Infinity`, `-Infinity`)이면 `RangeError`다. pose 값을
 * 먼저 모두 읽으므로 `out`이 입력 pose와 같은 객체여도 안전하다.
 *
 * @param out 역변환을 기록할 pose 객체
 * @param pose inverse를 구할 rigid pose
 */
export function invertPoseInto<Out extends Pose2Writable>(out: Out, pose: Pose2): Out {
  // aliasing 안전 - pose 값을 먼저 모두 읽은 후 기록한다
  const px = pose.px;
  const py = pose.py;
  const angle = pose.angle;
  validatePoseFinite(px, py, angle);

  return writeInvertedPose(out, px, py, angle);
}
