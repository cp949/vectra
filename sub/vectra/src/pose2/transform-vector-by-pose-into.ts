import { validatePoseFinite, validatePoseOperandFinite } from '../internal/pose2';
import type { Pose2, Point, PointWritable } from '../types/flat-shapes.internal';

/**
 * vector에 pose rotation만 적용한 결과를 out에 기록하고 out을 반환한다.
 *
 * `x' = cos(a)·x - sin(a)·y`, `y' = sin(a)·x + cos(a)·y`로 rotation을 적용하고 translation은
 * 의도적으로 무시한다. direction, normal, velocity 같은 free vector에 사용한다. pose
 * translation/angle 또는 `vector.x`/`vector.y`가 non-finite(`NaN`, `Infinity`, `-Infinity`)이면
 * `RangeError`다. pose와 vector 값을 먼저 모두 읽으므로 `vector`와 `out`, 또는 입력 pose와
 * `out`이 같은 object여도 안전하다.
 *
 * @param out 변환된 벡터를 기록할 점 객체
 * @param pose vector에 적용할 rigid pose
 * @param vector 변환할 free vector
 */
export function transformVectorByPoseInto<Out extends PointWritable>(out: Out, pose: Pose2, vector: Point): Out {
  const angle = pose.angle;
  const px = pose.px;
  const py = pose.py;
  validatePoseFinite(px, py, angle);
  // aliasing 안전 - vector 값을 먼저 읽은 후 기록한다
  const x = vector.x;
  const y = vector.y;
  validatePoseOperandFinite(x, y);

  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  // translation px/py를 의도적으로 제외한다 - direction/normal/velocity 같은 free vector에 사용
  out.x = cos * x - sin * y;
  out.y = sin * x + cos * y;
  return out;
}
