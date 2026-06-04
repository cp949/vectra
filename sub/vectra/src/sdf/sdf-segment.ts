import { readSegmentA, readSegmentB, segmentClosestPointXY } from '../internal/segment';
import type { SegmentLike, XYInput } from '../types';
import { requireFiniteX, requireFiniteY } from './primitive.internal';

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
export function sdfSegment(segment: SegmentLike, point: XYInput): number {
  const a = readSegmentA(segment);
  const b = readSegmentB(segment);
  const ax = requireFiniteX(a, 'segment a');
  const ay = requireFiniteY(a, 'segment a');
  const bx = requireFiniteX(b, 'segment b');
  const by = requireFiniteY(b, 'segment b');
  const px = requireFiniteX(point, 'point');
  const py = requireFiniteY(point, 'point');

  const closest = segmentClosestPointXY(ax, ay, bx, by, px, py);
  return Math.hypot(px - closest.x, py - closest.y);
}
