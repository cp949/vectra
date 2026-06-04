import { distanceSqXY, readX, readY } from '../internal/xy';
import type { BoundsLike, XYInput } from '../types';
import { clampPointXY } from './closest-point.internal';
import { isEmpty } from './is-empty';

/**
 * bounds와 point 사이의 최단 Euclidean 거리를 반환한다.
 *
 * empty bounds이면 Infinity를 반환한다.
 * 내부 또는 boundary point는 0을 반환한다.
 * 외부 point는 closed AABB 경계까지의 unsigned Euclidean distance를 반환한다.
 *
 * non-finite 좌표는 검증하지 않는다. NaN 입력은 NaN으로 전파된다.
 *
 * @param bounds 거리를 측정할 AABB
 * @param point 거리를 측정할 기준 좌표
 */
export function distanceToPoint(bounds: BoundsLike, point: XYInput): number {
  if (isEmpty(bounds)) return Infinity;
  const [cx, cy] = clampPointXY(bounds, point);
  const px = readX(point);
  const py = readY(point);
  return Math.sqrt(distanceSqXY(px, py, cx, cy));
}
