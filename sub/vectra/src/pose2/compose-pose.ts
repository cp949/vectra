import type { Pose2Like, Pose2Writable } from '../types';
import { composePoseInto } from './compose-pose-into';

/**
 * 두 rigid pose를 `left * right`로 합성한 결과를 새 plain pose object로 반환한다.
 *
 * `{ position: { x, y }, angle }`를 반환한다. `right`를 먼저 적용하고 `left`를 나중에 적용한다.
 * 산식은 `angle = left.angle + right.angle`,
 * `position = left.position + R(left.angle) * right.position`이다. angle 결과는 normalize하지
 * 않는다. 두 pose 중 한 pose의 translation/angle이라도 non-finite(`NaN`, `Infinity`, `-Infinity`)
 * 이면 `RangeError`다.
 *
 * @param left 나중에 적용할 rigid pose
 * @param right 먼저 적용할 rigid pose
 */
export function composePose(left: Pose2Like, right: Pose2Like): Pose2Writable {
  return composePoseInto({ position: { x: 0, y: 0 }, angle: 0 }, left, right);
}
