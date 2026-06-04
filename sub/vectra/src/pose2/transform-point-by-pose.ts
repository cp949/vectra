import type { Pose2Like, XYInput, XYObjectWritable } from '../types';
import { transformPointByPoseInto } from './transform-point-by-pose-into';

/**
 * point에 pose rigid transform을 적용한 결과를 새 plain point로 반환한다.
 *
 * `x' = cos(a)·x - sin(a)·y + px`, `y' = sin(a)·x + cos(a)·y + py`로 rotation 후 translation을
 * 적용한다. pose translation/angle 또는 `point.x`/`point.y`가 non-finite(`NaN`, `Infinity`,
 * `-Infinity`)이면 `RangeError`다.
 *
 * @param pose point에 적용할 rigid pose
 * @param point 변환할 point
 */
export function transformPointByPose(pose: Pose2Like, point: XYInput): XYObjectWritable {
  return transformPointByPoseInto({ x: 0, y: 0 }, pose, point);
}
