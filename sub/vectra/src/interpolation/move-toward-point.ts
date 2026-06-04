import type { XYInput } from '../types';
import { moveTowardPointInto } from './move-toward-point-into';

/**
 * current를 target 방향으로 최대 maxDistance만큼 이동한 좌표를 새 object로 반환한다.
 *
 * `maxDistance < 0`이면 RangeError를 던진다.
 * 모든 input의 x/y와 maxDistance는 finite number여야 한다.
 *
 * @param current 이동 시작 좌표
 * @param target 이동 목표 좌표
 * @param maxDistance 최대 이동 거리. 0 이상의 finite number여야 한다.
 */
export function moveTowardPoint(current: XYInput, target: XYInput, maxDistance: number): { x: number; y: number } {
  return moveTowardPointInto({ x: 0, y: 0 }, current, target, maxDistance);
}
