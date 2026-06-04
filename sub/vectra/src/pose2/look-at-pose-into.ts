import { validatePoseOperandFinite } from '../internal/pose2';
import { readX, readY, writeXY } from '../internal/xy';
import type { Pose2Writable, XYInput, XYWritable } from '../types';

/**
 * `position`에서 `target`을 향하는 rigid pose를 out에 기록하고 out을 반환한다.
 *
 * `out.position`에 `position`을, `out.angle`에 `Math.atan2(target.y - position.y,
 * target.x - position.x)`를 기록한다(radian). `position`과 `target`이 같은 좌표이면 방향을
 * 추론할 수 없으므로 `RangeError`를 던지고 `out`을 수정하지 않는다. `+0`/`-0`만 다른 좌표도 같은
 * 좌표로 본다. `position`이나 `target`의 성분이 non-finite(`NaN`, `Infinity`, `-Infinity`)이면
 * `RangeError`다. angle 결과는 normalize하지 않되, `atan2`가 signed zero 경계에서 반환하는
 * `-π`만 문서화한 `(-π, π]` 범위를 지키도록 `π`로 맞춘다. `position` 값을 먼저 읽으므로
 * `position`과 `out.position`이 같은 object여도 안전하다.
 *
 * @param out pose를 기록할 writable output
 * @param position pose의 위치이자 시선의 출발점
 * @param target 시선이 향하는 좌표
 */
export function lookAtPoseInto<Out extends Pose2Writable<XYWritable>>(
  out: Out,
  position: XYInput,
  target: XYInput
): Out {
  // aliasing 안전 - position 값을 먼저 읽은 후 기록한다
  const px = readX(position);
  const py = readY(position);
  validatePoseOperandFinite(px, py);
  const tx = readX(target);
  const ty = readY(target);
  validatePoseOperandFinite(tx, ty);

  const dx = tx - px;
  const dy = ty - py;
  if (dx === 0 && dy === 0) {
    throw new RangeError(
      `lookAtPose requires distinct position and target, got both at (${String(px)}, ${String(py)})`
    );
  }

  let angle = Math.atan2(dy, dx);
  // atan2(-0, 음수)는 -π를 반환한다. 문서화한 (-π, π] 범위를 지키도록 π로 맞춘다.
  if (angle === -Math.PI) {
    angle = Math.PI;
  }

  writeXY(out.position, px, py);
  out.angle = angle;
  return out;
}
