import { readX, readY, writeXY } from '../internal/xy';
import type { XYInput, XYWritable } from '../types';
import { findClosestCandidate } from './snap-candidate.internal';
import type { SnapCandidate } from './types';

/**
 * point를 radius 이내 가장 가까운 candidate로 snap해 out에 기록한다.
 *
 * hit: out에 기록 후 true 반환. miss: out 미수정, false 반환.
 * tie-break: insertion order 우선. out === point aliasing 안전.
 *
 * @param out 결과를 기록할 writable output
 * @param point 기준 point
 * @param candidates snap 후보 목록
 * @param radius 최대 허용 거리 (exclusive)
 * @returns snap 성공 시 snapped: true, 가장 가까운 candidate 좌표. radius 밖이면 snapped: false.
 */
export function magneticSnapInto<Out extends XYWritable>(
  out: Out,
  point: XYInput,
  candidates: SnapCandidate[],
  radius: number
): boolean {
  const px = readX(point);
  const py = readY(point);
  const result = findClosestCandidate(px, py, candidates, radius);
  if (!result) return false;
  writeXY(out, result.x, result.y);
  return true;
}
