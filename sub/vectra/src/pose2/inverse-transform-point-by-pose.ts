import type { Pose2Like, XYInput, XYObjectWritable } from '../types';
import { inverseTransformPointByPoseInto } from './inverse-transform-point-by-pose-into';

/**
 * point에 pose inverse rigid transform을 적용한 결과를 새 plain point로 반환한다.
 *
 * world point를 pose local frame 좌표로 되돌린다. `dx = x - px`, `dy = y - py`,
 * `x' = cos(a)·dx + sin(a)·dy`, `y' = -sin(a)·dx + cos(a)·dy`로 translation을 뺀 뒤 inverse
 * rotation을 적용한다. pose translation/angle 또는 `point.x`/`point.y`가 non-finite(`NaN`,
 * `Infinity`, `-Infinity`)이면 `RangeError`다.
 *
 * @param pose point에 적용할 rigid pose
 * @param point local frame으로 되돌릴 world point
 */
export function inverseTransformPointByPose(pose: Pose2Like, point: XYInput): XYObjectWritable {
  return inverseTransformPointByPoseInto({ x: 0, y: 0 }, pose, point);
}
