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
  const ax = line.x1;
  const ay = line.y1;
  const dx = line.x2 - ax;
  const dy = line.y2 - ay;
  const lenSq = dx * dx + dy * dy;
  const px = point.x - ax;
  const py = point.y - ay;
  let distSq: number;
  if (lenSq === 0) {
    distSq = px * px + py * py;
  } else {
    const t = Math.max(0, Math.min(1, (px * dx + py * dy) / lenSq));
    const cx = t * dx - px;
    const cy = t * dy - py;
    distSq = cx * cx + cy * cy;
  }
  return distSq <= epsilon * epsilon;
}
