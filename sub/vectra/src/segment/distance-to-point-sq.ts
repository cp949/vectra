import { readSegmentA, readSegmentB } from '../internal/segment';
import { readX, readY } from '../internal/xy';
import type { SegmentLike, XYInput } from '../types';

/**
 * point와 line 사이 최단 거리의 제곱을 반환한다.
 *
 * @param line 대상 segment
 * @param point 거리를 측정할 point
 */
export function distanceToPointSq(line: SegmentLike, point: XYInput): number {
  const ax = readX(readSegmentA(line));
  const ay = readY(readSegmentA(line));
  const dx = readX(readSegmentB(line)) - ax;
  const dy = readY(readSegmentB(line)) - ay;
  const lenSq = dx * dx + dy * dy;
  const px = readX(point) - ax;
  const py = readY(point) - ay;
  if (lenSq === 0) return px * px + py * py;
  const t = Math.max(0, Math.min(1, (px * dx + py * dy) / lenSq));
  const cx = t * dx - px;
  const cy = t * dy - py;
  return cx * cx + cy * cy;
}
