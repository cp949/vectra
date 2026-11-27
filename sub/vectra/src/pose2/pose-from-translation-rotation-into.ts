import { validatePoseFinite } from '../internal/pose2';
import type { Pose2Writable, Point } from '../types/flat-shapes.internal';

/**
 * translation과 rotation으로부터 rigid pose를 out에 기록하고 out을 반환한다.
 *
 * `out.px`, `out.py`에 translation 좌표를, `out.angle`에 angle을 기록한다. `translation.x`, `translation.y`,
 * `angle`이 non-finite(`NaN`, `Infinity`, `-Infinity`)이면 `RangeError`다. translation 값을 먼저 모두
 * 읽으므로 `translation`과 `out`이 같은 객체여도 안전하다.
 *
 * @param out 결과를 기록할 pose 객체
 * @param translation pose의 translation 위치
 * @param angle local frame 회전각. 단위는 radian.
 */
export function poseFromTranslationRotationInto<Out extends Pose2Writable>(
  out: Out,
  translation: Point,
  angle: number
): Out {
  // aliasing 안전 - translation 값을 먼저 읽은 후 기록한다
  const x = translation.x;
  const y = translation.y;
  validatePoseFinite(x, y, angle);

  out.px = x;
  out.py = y;
  out.angle = angle;
  return out;
}
