import type { XYInput, XYObjectWritable } from '../types';
import { projectOnInto } from './project-on-into';

/**
 * vector를 unit direction에 투영한 벡터를 새 object로 반환한다.
 *
 * direction은 unit vector 전제 (정규화 없음).
 *
 * @param vector 투영할 벡터
 * @param direction 투영 방향 (unit vector 전제)
 */
export function projectOn(vector: XYInput, direction: XYInput): XYObjectWritable {
  return projectOnInto({ x: 0, y: 0 }, vector, direction);
}
