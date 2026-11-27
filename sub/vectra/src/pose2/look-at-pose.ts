import type { Pose2Writable, Point } from '../types/flat-shapes.internal';
import { lookAtPoseInto } from './look-at-pose-into';

/**
 * `position`에서 `target`을 향하는 rigid pose를 새 plain pose object로 반환한다.
 *
 * `{ px, py, angle }`를 반환한다. `position`을 pose 위치로, `Math.atan2(target.y -
 * position.y, target.x - position.x)`를 angle로 쓴다(radian). `position`과 `target`이 같은
 * 좌표이면(`+0`/`-0` 차이 포함) 방향을 추론할 수 없으므로 `RangeError`다. `position`이나 `target`의
 * 성분이 non-finite(`NaN`, `Infinity`, `-Infinity`)이면 `RangeError`다. angle 결과는 normalize하지
 * 않되, `atan2`가 signed zero 경계에서 반환하는 `-π`만 `(-π, π]` 범위를 지키도록 `π`로 맞춘다.
 *
 * @param position pose의 위치이자 시선의 출발점
 * @param target 시선이 향하는 좌표
 */
export function lookAtPose(position: Point, target: Point): Pose2Writable {
  return lookAtPoseInto({ px: 0, py: 0, angle: 0 }, position, target);
}
