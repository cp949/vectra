import type { Segment, Point } from '../types/flat-shapes.internal';

/**
 * point와 line 사이 최단 거리의 제곱을 반환한다.
 *
 * @param line 대상 segment
 * @param point 거리를 측정할 point
 */
export function distanceToPointSq(line: Segment, point: Point): number {
  const ax = line.x1;
  const ay = line.y1;
  const dx = line.x2 - ax;
  const dy = line.y2 - ay;
  const lenSq = dx * dx + dy * dy;
  const px = point.x - ax;
  const py = point.y - ay;
  if (lenSq === 0) return px * px + py * py;
  const t = Math.max(0, Math.min(1, (px * dx + py * dy) / lenSq));
  const cx = t * dx - px;
  const cy = t * dy - py;
  return cx * cx + cy * cy;
}
