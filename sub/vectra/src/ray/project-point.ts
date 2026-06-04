import type { RayLike, XYInput, XYObjectWritable } from '../types';
import { projectPointInto } from './project-point-into';

/**
 * `point`에서 ray supporting infinite-line으로 내린 수선의 발을 새 plain object로 반환한다.
 *
 * unclamped. `projectPointInto`에 위임하는 companion wrapper다.
 *
 * degenerate/empty 입력 처리 정책은 `projectPointInto`와 동일하다.
 */
export function projectPoint(ray: RayLike, point: XYInput): XYObjectWritable {
  return projectPointInto({ x: 0, y: 0 }, ray, point);
}
