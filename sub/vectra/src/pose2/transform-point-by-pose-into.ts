import { validatePoseFinite, validatePoseOperandFinite } from '../internal/pose2';
import type { Pose2, Point, PointWritable } from '../types/flat-shapes.internal';

/**
 * point에 pose rigid transform을 적용한 결과를 out에 기록하고 out을 반환한다.
 *
 * `x' = cos(a)·x - sin(a)·y + px`, `y' = sin(a)·x + cos(a)·y + py`로 rotation 후 translation을
 * 적용한다. pose translation/angle 또는 `point.x`/`point.y`가 non-finite(`NaN`, `Infinity`,
 * `-Infinity`)이면 `RangeError`다. pose와 point 값을 먼저 모두 읽으므로 `point`와 `out`, 또는 입력
 * pose와 `out`이 같은 object여도 안전하다.
 *
 * @param out 변환된 점을 기록할 점 객체
 * @param pose point에 적용할 rigid pose
 * @param point 변환할 point
 */
export function transformPointByPoseInto<Out extends PointWritable>(out: Out, pose: Pose2, point: Point): Out {
  const angle = pose.angle;
  const px = pose.px;
  const py = pose.py;
  validatePoseFinite(px, py, angle);
  // aliasing 안전 - point 값을 먼저 읽은 후 기록한다
  const x = point.x;
  const y = point.y;
  validatePoseOperandFinite(x, y);

  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  out.x = cos * x - sin * y + px;
  out.y = sin * x + cos * y + py;
  return out;
}
