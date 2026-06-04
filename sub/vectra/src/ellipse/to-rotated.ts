import type { EllipseLike, RotatedEllipseWritable } from '../types';
import { toRotatedInto } from './to-rotated-into';

/**
 * axis-aligned ellipse를 rotation을 더한 rotated ellipse plain object로 반환한다.
 *
 * center와 radiusX/radiusY는 그대로 복사하고 rotation은 받은 radian 값을 그대로 기록한다.
 * rotation은 standard CCW이며 normalization을 적용하지 않는다.
 * empty(radiusX <= 0 || radiusY <= 0)나 non-finite 입력은 보정 없이 그대로 전파한다.
 *
 * @param ellipse 승급할 axis-aligned ellipse
 * @param rotation local x축 semi-axis의 회전각. radian, standard CCW
 */
export function toRotated(ellipse: EllipseLike, rotation: number): RotatedEllipseWritable {
  return toRotatedInto({ center: { x: 0, y: 0 }, radiusX: 0, radiusY: 0, rotation: 0 }, ellipse, rotation);
}
