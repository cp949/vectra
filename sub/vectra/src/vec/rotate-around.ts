import type { Point, PointWritable } from '../types/flat-shapes.internal';
import { rotateAroundInto } from './rotate-around-into';

/**
 * input 벡터를 center 기준으로 CCW 회전한 새 object를 반환한다.
 *
 * @param input 회전할 입력 벡터
 * @param center 회전 기준점
 * @param angle CCW 회전각(라디안)
 */
export function rotateAround(input: Point, center: Point, angle: number): PointWritable {
  return rotateAroundInto({ x: 0, y: 0 }, input, center, angle);
}
