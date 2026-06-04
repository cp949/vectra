import { DEFAULT_EPSILON } from '../internal/numeric';
import { readSegmentA, readSegmentB } from '../internal/segment';
import { readX, readY } from '../internal/xy';
import type { SegmentLike, XYInput } from '../types';

/**
 * point가 line 위에 있으면 true를 반환한다. distanceToPointSq <= epsilon * epsilon으로 판정한다.
 *
 * @param line 대상 segment
 * @param point 판정할 point
 * @param epsilon 거리 판정 임계값. 기본값은 DEFAULT_EPSILON
 */
export function containsPoint(line: SegmentLike, point: XYInput, epsilon: number = DEFAULT_EPSILON): boolean {
  const ax = readX(readSegmentA(line));
  const ay = readY(readSegmentA(line));
  const dx = readX(readSegmentB(line)) - ax;
  const dy = readY(readSegmentB(line)) - ay;
  const lenSq = dx * dx + dy * dy;
  const px = readX(point) - ax;
  const py = readY(point) - ay;
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
