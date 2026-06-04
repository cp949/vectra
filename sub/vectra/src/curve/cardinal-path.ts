import type { CardinalOptions, PathCommand, XYInput } from '../types';
import { cardinalPathInto } from './cardinal-path-into';

/**
 * Cardinal spline point list를 cubic Bezier PathCommand[]로 변환한 새 배열을 반환한다.
 *
 * n < 2이면 빈 배열을 반환한다.
 * 성능 최적화가 필요하면 `cardinalPathInto`를 사용한다.
 *
 * @param points 곡선 제어점 배열
 * @param options tension, closed, startAngle 옵션
 * @returns 새로 만든 PathCommand 배열
 */
export function cardinalPath(points: readonly XYInput[], options?: CardinalOptions): PathCommand[] {
  return cardinalPathInto([], points, options);
}
