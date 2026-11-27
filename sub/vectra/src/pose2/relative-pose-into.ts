import { validatePoseFinite, writeComposedPose } from '../internal/pose2';
import type { Pose2, Pose2Writable } from '../types/flat-shapes.internal';

/**
 * `from` frame에서 본 `to`의 relative transform을 out에 기록하고 out을 반환한다.
 *
 * `relativePose(from, to) = invert(from) * to`다. 결과를 `from`에 다시 합성하면 `to`가 된다:
 * `transformPointByPose(from, transformPointByPose(relativePose(from, to), local))`이
 * `transformPointByPose(to, local)`과 같다. 산식은 `angle = to.angle - from.angle`,
 * `position = R(-from.angle) * (to.px - from.px, to.py - from.py)`이다. angle 결과는 normalize하지
 * 않는다. `from`이나 `to`의 translation/angle이라도 non-finite(`NaN`, `Infinity`, `-Infinity`)이면
 * `RangeError`다. 두 pose 값을 먼저 모두 읽으므로 `out`이 `from` 또는 `to`와 같은 객체여도 안전하다.
 *
 * @param out 상대 변환을 기록할 pose 객체
 * @param from 기준 frame pose
 * @param to 기준 frame에서 표현할 target pose
 */
export function relativePoseInto<Out extends Pose2Writable>(out: Out, from: Pose2, to: Pose2): Out {
  // aliasing 안전 - 두 pose 값을 먼저 모두 읽은 후 기록한다
  const fx = from.px;
  const fy = from.py;
  const fa = from.angle;
  validatePoseFinite(fx, fy, fa);

  const tx = to.px;
  const ty = to.py;
  const ta = to.angle;
  validatePoseFinite(tx, ty, ta);

  // invert(from) 성분: angle = -fa, position = R(-fa) * (-(fx, fy))
  const cf = Math.cos(fa);
  const sf = Math.sin(fa);
  const ifx = -(cf * fx + sf * fy);
  const ify = sf * fx - cf * fy;

  // compose(invert(from), to)
  return writeComposedPose(out, ifx, ify, -fa, tx, ty, ta);
}
