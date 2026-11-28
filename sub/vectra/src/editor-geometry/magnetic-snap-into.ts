import type { Point, PointWritable } from '../types/flat-shapes.internal';
import { findClosestCandidate } from './snap-candidate.internal';
import type { SnapCandidate } from './types';

/**
 * point를 radius 이내 가장 가까운 candidate로 snap해 out에 기록한다.
 *
 * hit: out에 기록 후 true 반환. miss: out 미수정, false 반환.
 * tie-break: insertion order 우선. out === point aliasing 안전.
 *
 * @param out 결과 좌표를 기록할 출력 { x, y }
 * @param point 기준 point
 * @param candidates snap 후보 목록
 * @param radius 최대 허용 거리 (exclusive)
 * @returns snap 성공 시 true. radius 안에 후보가 없으면 false를 반환하고 out을 유지한다.
 */
export function magneticSnapInto(
  out: PointWritable,
  point: Point,
  candidates: SnapCandidate[],
  radius: number
): boolean {
  const px = point.x;
  const py = point.y;
  const result = findClosestCandidate(px, py, candidates, radius);
  if (!result) return false;
  out.x = result.x;
  out.y = result.y;
  return true;
}
