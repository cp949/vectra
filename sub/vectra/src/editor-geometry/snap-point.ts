/**
 * editor-geometry snap-point
 *
 * candidate 목록에서 가장 가까운 후보로 snap하는 high-level dispatcher.
 */

import { readX, readY } from '../internal/xy';
import type { XYInput } from '../types';
import { findClosestCandidate } from './snap-candidate.internal';
import type { SnapCandidate, SnapResult } from './types';

/**
 * candidate 목록에서 tolerance 이내 가장 가까운 후보로 snap한다.
 *
 * tolerance 미지정 시 Infinity (항상 snap). tie-break: insertion order 우선이다.
 *
 * @param point 기준 point
 * @param candidates snap 후보 목록
 * @param options.tolerance 최대 허용 거리. 미지정 시 Infinity
 * @returns snap 성공 시 snapped: true, 가장 가까운 candidate의 좌표와 distance. miss 시 snapped: false, 입력 좌표, distance: Infinity.
 */
export function snapPoint(point: XYInput, candidates: SnapCandidate[], options?: { tolerance?: number }): SnapResult {
  const px = readX(point);
  const py = readY(point);
  const threshold = options?.tolerance ?? Infinity;
  const result = findClosestCandidate(px, py, candidates, threshold);
  if (!result) return { snapped: false, x: px, y: py, distance: Infinity, source: 'none' };
  return { snapped: true, x: result.x, y: result.y, distance: result.distance, source: result.source };
}
