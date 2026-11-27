import { validatePoseFinite, writeComposedPose } from '../internal/pose2';
import type { Pose2, Pose2Writable } from '../types/flat-shapes.internal';

/**
 * 두 rigid pose를 `left * right`로 합성한 결과를 out에 기록하고 out을 반환한다.
 *
 * `right`를 먼저 적용하고 `left`를 나중에 적용한다. 산식은 `angle = left.angle + right.angle`,
 * `position = (left.px, left.py) + R(left.angle) * (right.px, right.py)`이다. angle 결과는 normalize하지
 * 않는다. 두 pose 중 한 pose의 translation/angle이라도 non-finite(`NaN`, `Infinity`, `-Infinity`)
 * 이면 `RangeError`다. 두 pose 값을 먼저 모두 읽으므로 `out`이 `left` 또는 `right`와 같은 객체여도 안전하다.
 *
 * @param out 합성 결과를 기록할 pose 객체
 * @param left 나중에 적용할 rigid pose
 * @param right 먼저 적용할 rigid pose
 */
export function composePoseInto<Out extends Pose2Writable>(out: Out, left: Pose2, right: Pose2): Out {
  // aliasing 안전 - 두 pose 값을 먼저 모두 읽은 후 기록한다
  const lx = left.px;
  const ly = left.py;
  const la = left.angle;
  validatePoseFinite(lx, ly, la);

  const rx = right.px;
  const ry = right.py;
  const ra = right.angle;
  validatePoseFinite(rx, ry, ra);

  return writeComposedPose(out, lx, ly, la, rx, ry, ra);
}
