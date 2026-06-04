import {
  readPoseAngle,
  readPosePosition,
  shortestAngleDifferenceAbs,
  validatePoseEpsilon,
  validatePoseFinite,
} from '../internal/pose2';
import { readX, readY } from '../internal/xy';
import type { Pose2Like, PoseApproxEqualsOptions } from '../types';

/**
 * 두 rigid pose가 position/angle 허용 오차 안에서 같은지 boolean으로 반환한다.
 *
 * position과 angle을 분리해 비교한다. position은 `Math.hypot(ax - bx, ay - by) <=
 * positionEpsilon`, angle은 shortest angular difference의 absolute value가 `<= angleEpsilon`이면
 * 같다고 본다. 둘 다 만족해야 `true`다. `poseDistance` 같은 결합 scalar metric이 아니다.
 *
 * angle 비교는 `2π` wrap-around에서도 shortest difference로 안정적이다(예: `0.3`과 `0.3 + 2π`는
 * 같다). 입력 pose angle을 normalize하지 않고 비교 내부에서만 shortest difference를 계산한다.
 *
 * 두 pose의 `position.x`/`position.y`/`angle` 중 하나라도 non-finite(`NaN`, `Infinity`,
 * `-Infinity`)이면 `RangeError`다. `positionEpsilon`/`angleEpsilon`이 non-finite이거나 음수이면
 * `RangeError`다.
 *
 * @param a 비교할 첫 pose
 * @param b 비교할 둘째 pose
 * @param options 비교 옵션. `positionEpsilon`/`angleEpsilon` 생략 시 각 `1e-9`. non-finite/음수는 `RangeError`.
 */
export function poseApproxEquals(a: Pose2Like, b: Pose2Like, options?: PoseApproxEqualsOptions): boolean {
  const aPosition = readPosePosition(a);
  const ax = readX(aPosition);
  const ay = readY(aPosition);
  const aAngle = readPoseAngle(a);
  validatePoseFinite(ax, ay, aAngle);

  const bPosition = readPosePosition(b);
  const bx = readX(bPosition);
  const by = readY(bPosition);
  const bAngle = readPoseAngle(b);
  validatePoseFinite(bx, by, bAngle);

  const positionEpsilon = options?.positionEpsilon ?? 1e-9;
  validatePoseEpsilon(positionEpsilon, 'positionEpsilon');
  const angleEpsilon = options?.angleEpsilon ?? 1e-9;
  validatePoseEpsilon(angleEpsilon, 'angleEpsilon');

  const positionEqual = Math.hypot(ax - bx, ay - by) <= positionEpsilon;
  const angleEqual = shortestAngleDifferenceAbs(aAngle, bAngle) <= angleEpsilon;
  return positionEqual && angleEqual;
}
