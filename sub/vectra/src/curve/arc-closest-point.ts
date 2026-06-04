import type { CenterArcLike, ClosestPointOptions, XYInput, XYObjectWritable } from '../types';
import { arcClosestPointInto } from './arc-closest-point-into';

/**
 * center form arc 위에서 point에 가장 가까운 점을 새 object로 반환한다.
 *
 * `arcClosestPointInto`의 allocating companion이다.
 *
 *
 * degenerate/empty 입력 처리 정책은 `arcClosestPointInto`와 동일하다.
 * tolerance/iteration option 정책은 `arcClosestPointInto`와 동일하다.
 * @param centerArc center form arc input
 * @param point 투영 기준 점
 * @param options 수치 최적화 옵션
 */
export function arcClosestPoint(
  centerArc: CenterArcLike,
  point: XYInput,
  options?: ClosestPointOptions
): XYObjectWritable {
  return arcClosestPointInto({ x: 0, y: 0 }, centerArc, point, options);
}
