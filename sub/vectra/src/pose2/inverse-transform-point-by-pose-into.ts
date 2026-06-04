import { readPoseAngle, readPosePosition, validatePoseFinite, validatePoseOperandFinite } from '../internal/pose2';
import { readX, readY, writeXY } from '../internal/xy';
import type { Pose2Like, XYInput, XYWritable } from '../types';

/**
 * point에 pose inverse rigid transform을 적용한 결과를 out에 기록하고 out을 반환한다.
 *
 * world point를 pose local frame 좌표로 되돌린다. `dx = x - px`, `dy = y - py`,
 * `x' = cos(a)·dx + sin(a)·dy`, `y' = -sin(a)·dx + cos(a)·dy`로 translation을 뺀 뒤 inverse
 * rotation을 적용한다. pose translation/angle 또는 `point.x`/`point.y`가 non-finite(`NaN`,
 * `Infinity`, `-Infinity`)이면 `RangeError`다. pose와 point 값을 먼저 모두 읽으므로 `point`와 `out`,
 * 또는 pose position과 `out`이 같은 object여도 안전하다.
 *
 * @param out 변환된 point를 기록할 writable output
 * @param pose point에 적용할 rigid pose
 * @param point local frame으로 되돌릴 world point
 */
export function inverseTransformPointByPoseInto<Out extends XYWritable>(
  out: Out,
  pose: Pose2Like,
  point: XYInput
): Out {
  const angle = readPoseAngle(pose);
  const position = readPosePosition(pose);
  const px = readX(position);
  const py = readY(position);
  validatePoseFinite(px, py, angle);
  // aliasing 안전 - point 값을 먼저 읽은 후 기록한다
  const x = readX(point);
  const y = readY(point);
  validatePoseOperandFinite(x, y);

  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  const dx = x - px;
  const dy = y - py;
  return writeXY(out, cos * dx + sin * dy, -sin * dx + cos * dy);
}
