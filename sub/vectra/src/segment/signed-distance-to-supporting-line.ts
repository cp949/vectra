import { readSegmentA, readSegmentB } from '../internal/segment';
import { readX, readY } from '../internal/xy';
import type { SegmentLike, XYInput } from '../types';

/**
 * point에서 segment의 supporting infinite line까지 부호 있는 거리를 반환한다.
 *
 * 공식: `cross(d, point - a) / |d|`
 * - `d = b - a`, cross product는 2D outer product `d.x * (py - ay) - d.y * (px - ax)`.
 * - 좌측(진행 방향 기준 left)이 양수, 우측이 음수.
 * - zero-length segment(|d| === 0): 0을 반환한다.
 * - non-finite 입력은 별도 validation 없이 JavaScript number 연산 결과를 따른다.
 *
 * @param line 기준 segment
 * @param point 거리를 측정할 point
 */
export function signedDistanceToSupportingLine(line: SegmentLike, point: XYInput): number {
  const a = readSegmentA(line);
  const b = readSegmentB(line);
  const ax = readX(a);
  const ay = readY(a);
  const dx = readX(b) - ax;
  const dy = readY(b) - ay;
  const len = Math.hypot(dx, dy);
  if (len === 0) return 0;
  const px = readX(point) - ax;
  const py = readY(point) - ay;
  // 2D cross product: d × (point - a) = dx * py - dy * px
  return (dx * py - dy * px) / len;
}
