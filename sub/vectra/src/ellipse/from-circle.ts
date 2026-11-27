import type { Circle, EllipseWritable } from '../types/flat-shapes.internal';
import { createZeroEllipse } from '../internal/ellipse';
import { fromCircleInto } from './from-circle-into';

/**
 * circle을 axis-aligned ellipse로 upcast해 새 plain object로 반환한다.
 *
 * `cx = circle.cx`, `cy = circle.cy`, `rx = ry = circle.r`로 기록한다.
 * `circle.r <= 0`이어도 empty 여부 보정 없이 그대로 기록한다.
 * non-finite center 좌표와 radius는 별도 검증 없이 그대로 전파한다.
 *
 * @param circle ellipse로 upcast할 circle
 */
export function fromCircle(circle: Circle): EllipseWritable {
  return fromCircleInto(createZeroEllipse(), circle);
}
