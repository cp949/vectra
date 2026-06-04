import { readPoseAngle, readPosePosition, validatePoseFinite, validatePoseOperandFinite } from '../internal/pose2';
import { readX, readY, writeXY } from '../internal/xy';
import type { Pose2Like, XYInput, XYWritable } from '../types';

/**
 * vector에 pose inverse rotation만 적용한 결과를 out에 기록하고 out을 반환한다.
 *
 * `x' = cos(a)·x + sin(a)·y`, `y' = -sin(a)·x + cos(a)·y`로 inverse rotation을 적용하고
 * translation은 의도적으로 무시한다. direction, normal, velocity 같은 free vector에 사용한다. pose
 * translation/angle 또는 `vector.x`/`vector.y`가 non-finite(`NaN`, `Infinity`, `-Infinity`)이면
 * `RangeError`다. pose와 vector 값을 먼저 모두 읽으므로 `vector`와 `out`, 또는 pose position과
 * `out`이 같은 object여도 안전하다.
 *
 * @param out 변환된 vector를 기록할 writable output
 * @param pose vector에 적용할 rigid pose
 * @param vector local frame으로 되돌릴 free vector
 */
export function inverseTransformVectorByPoseInto<Out extends XYWritable>(
  out: Out,
  pose: Pose2Like,
  vector: XYInput
): Out {
  const angle = readPoseAngle(pose);
  const position = readPosePosition(pose);
  const px = readX(position);
  const py = readY(position);
  validatePoseFinite(px, py, angle);
  // aliasing 안전 - vector 값을 먼저 읽은 후 기록한다
  const x = readX(vector);
  const y = readY(vector);
  validatePoseOperandFinite(x, y);

  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  // translation px/py를 의도적으로 제외한다 - direction/normal/velocity 같은 free vector에 사용
  return writeXY(out, cos * x + sin * y, -sin * x + cos * y);
}
