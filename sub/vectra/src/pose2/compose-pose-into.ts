import { readPoseAngle, readPosePosition, validatePoseFinite, writeComposedPose } from '../internal/pose2';
import { readX, readY } from '../internal/xy';
import type { Pose2Like, Pose2Writable, XYWritable } from '../types';

/**
 * 두 rigid pose를 `left * right`로 합성한 결과를 out에 기록하고 out을 반환한다.
 *
 * `right`를 먼저 적용하고 `left`를 나중에 적용한다. 산식은 `angle = left.angle + right.angle`,
 * `position = left.position + R(left.angle) * right.position`이다. angle 결과는 normalize하지
 * 않는다. 두 pose 중 한 pose의 translation/angle이라도 non-finite(`NaN`, `Infinity`, `-Infinity`)
 * 이면 `RangeError`다. 두 pose 값을 먼저 모두 읽으므로 `out.position`이 `left` 또는 `right`
 * position과 같은 object여도 안전하다.
 *
 * @param out 합성 결과를 기록할 writable pose output
 * @param left 나중에 적용할 rigid pose
 * @param right 먼저 적용할 rigid pose
 */
export function composePoseInto<Out extends Pose2Writable<XYWritable>>(
  out: Out,
  left: Pose2Like,
  right: Pose2Like
): Out {
  // aliasing 안전 - 두 pose 값을 먼저 모두 읽은 후 기록한다
  const leftPosition = readPosePosition(left);
  const lx = readX(leftPosition);
  const ly = readY(leftPosition);
  const la = readPoseAngle(left);
  validatePoseFinite(lx, ly, la);

  const rightPosition = readPosePosition(right);
  const rx = readX(rightPosition);
  const ry = readY(rightPosition);
  const ra = readPoseAngle(right);
  validatePoseFinite(rx, ry, ra);

  return writeComposedPose(out, lx, ly, la, rx, ry, ra);
}
