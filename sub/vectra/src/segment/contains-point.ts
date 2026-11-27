import { segmentContainsPoint } from '../internal/segment';
import { DEFAULT_EPSILON } from '../internal/numeric';
import type { Segment, Point } from '../types/flat-shapes.internal';

/**
 * point가 line 위에 있으면 true를 반환한다. distanceToPointSq <= epsilon * epsilon으로 판정한다.
 *
 * @param line 대상 segment
 * @param point 판정할 point
 * @param epsilon 거리 판정 임계값. 기본값은 DEFAULT_EPSILON
 */
export function containsPoint(line: Segment, point: Point, epsilon: number = DEFAULT_EPSILON): boolean {
  return segmentContainsPoint(line, point.x, point.y, epsilon);
}
