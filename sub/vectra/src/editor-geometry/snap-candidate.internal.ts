/**
 * editor-geometry snap candidate ranking internal helper.
 *
 * candidate 목록에서 가장 가까운 후보를 찾는 공통 로직을 제공한다.
 * 이 module은 editor-geometry domain 내부 전용이다.
 */

import { distanceSqXY } from '../internal/xy';
import type { SnapCandidate, SnapSource } from './types';

/**
 * candidates에서 threshold 미만 거리 이내 가장 가까운 후보를 찾는다.
 *
 * tie-break: insertion order 우선 (strictly less than 비교로 첫 번째 유지).
 * squared 거리로 비교해 후보당 sqrt 호출을 winner 한 번으로 줄인다.
 * 없으면 null을 반환한다.
 *
 * @param px 기준점 x
 * @param py 기준점 y
 * @param candidates 후보 목록
 * @param threshold 최대 거리 (exclusive: dist < threshold여야 hit). NaN/음수면 모든 후보 miss.
 */
export function findClosestCandidate(
  px: number,
  py: number,
  candidates: SnapCandidate[],
  threshold: number
): { x: number; y: number; distance: number; source: SnapSource } | null {
  // threshold가 양의 유한수가 아니면(0, 음수, NaN) 모두 miss. 음수가 제곱돼 false-hit가 되는 것을 막는다.
  if (!(threshold > 0)) return null;
  let bestDistSq = threshold * threshold;
  let bestX = 0;
  let bestY = 0;
  let bestSource: SnapSource = 'none';
  let found = false;

  for (const c of candidates) {
    const distSq = distanceSqXY(c.x, c.y, px, py);
    if (distSq < bestDistSq) {
      bestDistSq = distSq;
      bestX = c.x;
      bestY = c.y;
      bestSource = c.source;
      found = true;
    }
  }

  return found ? { x: bestX, y: bestY, distance: Math.sqrt(bestDistSq), source: bestSource } : null;
}
