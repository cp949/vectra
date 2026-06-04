import { validatePoseFinite } from '../internal/pose2';
import { readX, readY, writeXY } from '../internal/xy';
import type { Pose2Writable, XYInput, XYWritable } from '../types';

/**
 * translation과 rotation으로부터 rigid pose를 out에 기록하고 out을 반환한다.
 *
 * `out.position`에 translation을, `out.angle`에 angle을 기록한다. `translation.x`, `translation.y`,
 * `angle`이 non-finite(`NaN`, `Infinity`, `-Infinity`)이면 `RangeError`다. translation 값을 먼저 모두
 * 읽으므로 `translation`과 `out.position`이 같은 object여도 안전하다.
 *
 * @param out pose를 기록할 writable output
 * @param translation pose의 translation 위치
 * @param angle local frame 회전각. 단위는 radian.
 */
export function poseFromTranslationRotationInto<Out extends Pose2Writable<XYWritable>>(
  out: Out,
  translation: XYInput,
  angle: number
): Out {
  // aliasing 안전 - translation 값을 먼저 읽은 후 기록한다
  const x = readX(translation);
  const y = readY(translation);
  validatePoseFinite(x, y, angle);

  writeXY(out.position, x, y);
  out.angle = angle;
  return out;
}
