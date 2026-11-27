import type { Segment, Point } from '../types/flat-shapes.internal';

/**
 * point의 line 위 parametric 위치 t를 unclamped로 반환한다. zero-length segment는 0을 반환한다.
 *
 * @param line 대상 segment
 * @param point line에 투영할 point
 */
export function projectionT(line: Segment, point: Point): number {
  const ax = line.x1;
  const ay = line.y1;
  const dx = line.x2 - ax;
  const dy = line.y2 - ay;
  const lenSq = dx * dx + dy * dy;
  if (lenSq === 0) return 0;
  const px = point.x - ax;
  const py = point.y - ay;
  return (px * dx + py * dy) / lenSq;
}
