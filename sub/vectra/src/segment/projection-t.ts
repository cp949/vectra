import { readSegmentA, readSegmentB } from '../internal/segment';
import { readX, readY } from '../internal/xy';
import type { SegmentLike, XYInput } from '../types';

/**
 * point의 line 위 parametric 위치 t를 unclamped로 반환한다. zero-length segment는 0을 반환한다.
 *
 * @param line 대상 segment
 * @param point line에 투영할 point
 */
export function projectionT(line: SegmentLike, point: XYInput): number {
  const ax = readX(readSegmentA(line));
  const ay = readY(readSegmentA(line));
  const dx = readX(readSegmentB(line)) - ax;
  const dy = readY(readSegmentB(line)) - ay;
  const lenSq = dx * dx + dy * dy;
  if (lenSq === 0) return 0;
  const px = readX(point) - ax;
  const py = readY(point) - ay;
  return (px * dx + py * dy) / lenSq;
}
