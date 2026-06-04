import type { XYInput, XYObjectWritable } from '../types';
import { perpendicularInto } from './perpendicular-into';

/**
 * input 벡터의 CCW 90도 수직 벡터 (-y, x)를 새 object로 반환한다.
 *
 * zero vector 입력에서는 throw하지 않고 (0, 0)을 반환한다.
 *
 * @param input CCW 90도 회전할 입력 벡터
 */
export function perpendicular(input: XYInput): XYObjectWritable {
  return perpendicularInto({ x: 0, y: 0 }, input);
}
