import { toUnitVectorInto } from './to-unit-vector-into';

/**
 * 주어진 각도에 해당하는 unit vector를 담은 새 object를 반환한다.
 *
 * vec.fromAngle과 mental model이 다른 angle domain equivalent이다.
 * non-finite angle은 RangeError를 던진다.
 *
 * @param angle unit vector 방향각(라디안)
 */
export function toUnitVector(angle: number): { x: number; y: number } {
  return toUnitVectorInto({ x: 0, y: 0 }, angle);
}
