import type { Pose2Writable, Point } from '../types/flat-shapes.internal';
import { poseFromTranslationRotationInto } from './pose-from-translation-rotation-into';

/**
 * translation과 rotation으로부터 rigid pose를 새 plain object로 반환한다.
 *
 * `{ px, py, angle }`를 반환한다. `translation.x`, `translation.y`, `angle`이
 * non-finite(`NaN`, `Infinity`, `-Infinity`)이면 `RangeError`다.
 *
 * @param translation pose의 translation 위치
 * @param angle local frame 회전각. 단위는 radian.
 */
export function poseFromTranslationRotation(translation: Point, angle: number): Pose2Writable {
  return poseFromTranslationRotationInto({ px: 0, py: 0, angle: 0 }, translation, angle);
}
