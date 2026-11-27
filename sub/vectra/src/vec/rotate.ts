import type { Point, PointWritable } from '../types/flat-shapes.internal';
import { rotateInto } from './rotate-into';

/**
 * input 벡터를 원점 기준으로 CCW 회전한 새 object를 반환한다.
 *
 * @param input 회전할 입력 벡터
 * @param angle CCW 회전각(라디안)
 */
export function rotate(input: Point, angle: number): PointWritable {
  return rotateInto({ x: 0, y: 0 }, input, angle);
}
