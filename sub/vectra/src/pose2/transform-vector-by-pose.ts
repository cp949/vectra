import type { Pose2Like, XYInput, XYObjectWritable } from '../types';
import { transformVectorByPoseInto } from './transform-vector-by-pose-into';

/**
 * vector에 pose rotation만 적용한 결과를 새 plain vector로 반환한다.
 *
 * `x' = cos(a)·x - sin(a)·y`, `y' = sin(a)·x + cos(a)·y`로 rotation을 적용하고 translation은
 * 의도적으로 무시한다. direction, normal, velocity 같은 free vector에 사용한다. pose
 * translation/angle 또는 `vector.x`/`vector.y`가 non-finite(`NaN`, `Infinity`, `-Infinity`)이면
 * `RangeError`다.
 *
 * @param pose vector에 적용할 rigid pose
 * @param vector 변환할 free vector
 */
export function transformVectorByPose(pose: Pose2Like, vector: XYInput): XYObjectWritable {
  return transformVectorByPoseInto({ x: 0, y: 0 }, pose, vector);
}
