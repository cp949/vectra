import type { Point } from '../types/flat-shapes.internal';
import type { HandleId, HandlePoint } from './types';

/**
 * cursor에서 가장 가까운 handle을 반환한다.
 *
 * tolerance 이내 handle이 없으면 undefined를 반환한다. 동거리이면 insertion order 우선이다.
 *
 * @param handles hit-test 대상 handle 배열
 * @param cursor 커서 위치 (world 좌표)
 * @param tolerance world 좌표 단위 최대 허용 거리. 양의 유한수가 아니면 miss.
 */
export function handleAtPoint(handles: HandlePoint[], cursor: Point, tolerance: number): HandleId | undefined {
  const cx = cursor.x;
  const cy = cursor.y;
  if (!(tolerance > 0 && Number.isFinite(tolerance))) {
    return undefined;
  }
  const tolSq = tolerance * tolerance;
  let bestDistSq = Infinity;
  let bestId: HandleId | undefined;

  for (const h of handles) {
    const hx = h.point.x;
    const hy = h.point.y;
    const dx = hx - cx;
    const dy = hy - cy;
    const distSq = dx * dx + dy * dy;
    if (distSq <= tolSq && distSq < bestDistSq) {
      bestDistSq = distSq;
      bestId = h.id;
    }
  }

  return bestId;
}
