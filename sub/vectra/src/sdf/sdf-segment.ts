import { segmentClosestPointXY } from '../internal/segment';
import type { Point, Segment } from '../types/flat-shapes.internal';
import { requireFinite } from './primitive.internal';
import { hypot2 } from '../internal/numeric';

/**
 * segment와 point 사이의 signed distance를 반환한다.
 *
 * segment는 thickness가 없으므로 interior 음수 영역이 없다. segment 위 point는 0, 밖은 unsigned
 * 최단 거리인 양수다. radius 0 capsule과 같다.
 *
 * zero-length segment(`a === b`)는 endpoint까지의 point distance로 처리한다.
 *
 * 모든 좌표는 finite여야 한다. non-finite segment endpoint나 point 좌표는 `RangeError`다.
 *
 * @param segment signed distance를 측정할 segment
 * @param point segment까지의 signed distance를 측정할 point
 */
export function sdfSegment(segment: Segment, point: Point): number {
  const ax = requireFinite(segment.x1, 'segment a x');
  const ay = requireFinite(segment.y1, 'segment a y');
  const bx = requireFinite(segment.x2, 'segment b x');
  const by = requireFinite(segment.y2, 'segment b y');
  const px = requireFinite(point.x, 'point x');
  const py = requireFinite(point.y, 'point y');

  const closest = segmentClosestPointXY(ax, ay, bx, by, px, py);
  return hypot2(px - closest.x, py - closest.y);
}
