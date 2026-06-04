import { readPoseAngle, readPosePosition, validatePoseFinite, writeComposedPose } from '../internal/pose2';
import { readX, readY } from '../internal/xy';
import type { Pose2Like, Pose2Writable, XYWritable } from '../types';

/**
 * `from` frame에서 본 `to`의 relative transform을 out에 기록하고 out을 반환한다.
 *
 * `relativePose(from, to) = invert(from) * to`다. 결과를 `from`에 다시 합성하면 `to`가 된다:
 * `transformPointByPose(from, transformPointByPose(relativePose(from, to), local))`이
 * `transformPointByPose(to, local)`과 같다. 산식은 `angle = to.angle - from.angle`,
 * `position = R(-from.angle) * (to.position - from.position)`이다. angle 결과는 normalize하지
 * 않는다. `from`이나 `to`의 translation/angle이라도 non-finite(`NaN`, `Infinity`, `-Infinity`)이면
 * `RangeError`다. 두 pose 값을 먼저 모두 읽으므로 `out.position`이 `from` 또는 `to` position과 같은
 * object여도 안전하다.
 *
 * @param out relative transform을 기록할 writable pose output
 * @param from 기준 frame pose
 * @param to 기준 frame에서 표현할 target pose
 */
export function relativePoseInto<Out extends Pose2Writable<XYWritable>>(out: Out, from: Pose2Like, to: Pose2Like): Out {
  // aliasing 안전 - 두 pose 값을 먼저 모두 읽은 후 기록한다
  const fromPosition = readPosePosition(from);
  const fx = readX(fromPosition);
  const fy = readY(fromPosition);
  const fa = readPoseAngle(from);
  validatePoseFinite(fx, fy, fa);

  const toPosition = readPosePosition(to);
  const tx = readX(toPosition);
  const ty = readY(toPosition);
  const ta = readPoseAngle(to);
  validatePoseFinite(tx, ty, ta);

  // invert(from) 성분: angle = -fa, position = R(-fa) * (-from.position)
  const cf = Math.cos(fa);
  const sf = Math.sin(fa);
  const ifx = -(cf * fx + sf * fy);
  const ify = sf * fx - cf * fy;

  // compose(invert(from), to)
  return writeComposedPose(out, ifx, ify, -fa, tx, ty, ta);
}
