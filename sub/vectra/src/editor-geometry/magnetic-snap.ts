import type { Point } from '../types/flat-shapes.internal';
import { findClosestCandidate } from './snap-candidate.internal';
import type { SnapCandidate, SnapResult } from './types';

/**
 * magneticSnapInto의 allocating companion.
 *
 * hit 없으면 snapped: false, 입력 좌표, distance: Infinity를 반환한다.
 *
 * @param point 기준 point
 * @param candidates snap 후보 목록
 * @param radius 최대 허용 거리 (exclusive)
 * @returns snap 성공 시 snapped: true, 가장 가까운 candidate 좌표. radius 밖이면 snapped: false.
 */
export function magneticSnap(point: Point, candidates: SnapCandidate[], radius: number): SnapResult {
  const px = point.x;
  const py = point.y;
  const result = findClosestCandidate(px, py, candidates, radius);
  if (!result) return { snapped: false, x: px, y: py, distance: Infinity, source: 'none' };
  return { snapped: true, x: result.x, y: result.y, distance: result.distance, source: result.source };
}
