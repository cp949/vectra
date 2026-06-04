import type { Pose2Like, Pose2Writable } from '../types';
import { relativePoseInto } from './relative-pose-into';

/**
 * `from` frame에서 본 `to`의 relative transform을 새 plain pose object로 반환한다.
 *
 * `{ position: { x, y }, angle }`를 반환한다. `relativePose(from, to) = invert(from) * to`다.
 * 결과를 `from`에 다시 합성하면 `to`가 된다. 산식은 `angle = to.angle - from.angle`,
 * `position = R(-from.angle) * (to.position - from.position)`이다. angle 결과는 normalize하지
 * 않는다. `from`이나 `to`의 translation/angle이라도 non-finite(`NaN`, `Infinity`, `-Infinity`)이면
 * `RangeError`다.
 *
 * @param from 기준 frame pose
 * @param to 기준 frame에서 표현할 target pose
 */
export function relativePose(from: Pose2Like, to: Pose2Like): Pose2Writable {
  return relativePoseInto({ position: { x: 0, y: 0 }, angle: 0 }, from, to);
}
