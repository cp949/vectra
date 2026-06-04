import {
  readPoseAngle,
  readPosePosition,
  shortestAngleDifferenceAbs,
  validatePoseEpsilon,
  validatePoseFinite,
} from '../internal/pose2';
import { readX, readY } from '../internal/xy';
import type { Pose2Like, PoseDistanceOptions } from '../types';

/**
 * 두 rigid pose 사이 거리를 translation/angular 결합 scalar로 반환한다.
 *
 * position distance는 `Math.hypot(ax - bx, ay - by)`, angular distance는 shortest angular
 * difference의 absolute value다. 둘을 `Math.hypot(positionDistance, angularDistance *
 * angularWeight)`로 결합한다. `angularWeight`가 radian angle 값을 position 거리 단위로 환산한다.
 * `poseApproxEquals` 같은 분리 boolean 비교가 아니라 단일 결합 metric이다.
 *
 * angle 비교는 `2π` wrap-around에서도 shortest difference로 안정적이다(예: `0.3`과 `0.3 + 2π`는
 * angle distance `0`). 입력 pose angle을 normalize하지 않고 내부에서만 shortest difference를 계산한다.
 * `angularWeight: 0`이면 translation-only distance가 된다.
 *
 * 두 pose의 `position.x`/`position.y`/`angle` 중 하나라도 non-finite(`NaN`, `Infinity`,
 * `-Infinity`)이면 `RangeError`다. `angularWeight`가 non-finite이거나 음수이면 `RangeError`다.
 * 결합 결과가 non-finite이면(position 차이나 weighted angular product가 overflow하면) `RangeError`다.
 * overflow를 `Infinity`로 조용히 반환하지 않는다.
 *
 * @param a 거리를 잴 첫 pose
 * @param b 거리를 잴 둘째 pose
 * @param options 거리 옵션. `angularWeight` 생략 시 `1`. non-finite/음수는 `RangeError`.
 */
export function poseDistance(a: Pose2Like, b: Pose2Like, options?: PoseDistanceOptions): number {
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

  const angularWeight = options?.angularWeight ?? 1;
  validatePoseEpsilon(angularWeight, 'angularWeight');

  const positionDistance = Math.hypot(ax - bx, ay - by);
  const angularDistance = shortestAngleDifferenceAbs(aAngle, bAngle);
  const distance = Math.hypot(positionDistance, angularDistance * angularWeight);
  if (!Number.isFinite(distance)) {
    throw new RangeError(
      `poseDistance result must be finite, got ${String(distance)} (positionDistance ${String(positionDistance)}, angularDistance ${String(angularDistance)}, angularWeight ${String(angularWeight)})`
    );
  }
  return distance;
}
