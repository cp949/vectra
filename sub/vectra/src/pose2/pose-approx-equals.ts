import { shortestAngleDifferenceAbs, validatePoseEpsilon, validatePoseFinite } from '../internal/pose2';
import type { PoseApproxEqualsOptions } from '../types';
import type { Pose2 } from '../types/flat-shapes.internal';
import { hypot2 } from '../internal/numeric';

/**
 * 두 rigid pose가 position/angle 허용 오차 안에서 같은지 boolean으로 반환한다.
 *
 * position과 angle을 분리해 비교한다. position은 `hypot(ax - bx, ay - by) <=
 * positionEpsilon`, angle은 shortest angular difference의 absolute value가 `<= angleEpsilon`이면
 * 같다고 본다. 둘 다 만족해야 `true`다. `poseDistance` 같은 결합 scalar metric이 아니다.
 *
 * angle 비교는 `2π` wrap-around에서도 shortest difference로 안정적이다(예: `0.3`과 `0.3 + 2π`는
 * 같다). 입력 pose angle을 normalize하지 않고 비교 내부에서만 shortest difference를 계산한다.
 *
 * 두 pose의 `px`/`py`/`angle` 중 하나라도 non-finite(`NaN`, `Infinity`,
 * `-Infinity`)이면 `RangeError`다. `positionEpsilon`/`angleEpsilon`이 non-finite이거나 음수이면
 * `RangeError`다.
 *
 * @param a 비교할 첫 pose
 * @param b 비교할 둘째 pose
 * @param options 비교 옵션.
 */
export function poseApproxEquals(a: Pose2, b: Pose2, options?: PoseApproxEqualsOptions): boolean {
  const ax = a.px;
  const ay = a.py;
  const aAngle = a.angle;
  validatePoseFinite(ax, ay, aAngle);

  const bx = b.px;
  const by = b.py;
  const bAngle = b.angle;
  validatePoseFinite(bx, by, bAngle);

  const positionEpsilon = options === undefined ? 1e-9 : options.positionEpsilon;
  validatePoseEpsilon(positionEpsilon, 'positionEpsilon');
  const angleEpsilon = options === undefined ? 1e-9 : options.angleEpsilon;
  validatePoseEpsilon(angleEpsilon, 'angleEpsilon');

  const positionEqual = hypot2(ax - bx, ay - by) <= positionEpsilon;
  const angleEqual = shortestAngleDifferenceAbs(aAngle, bAngle) <= angleEpsilon;
  return positionEqual && angleEqual;
}
