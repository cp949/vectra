import { snapScalar } from '../math/snap.internal';

/**
 * distance를 step 단위로 snap한다.
 *
 * scalar 입력. validation 없음.
 *
 * @param distance snap할 거리
 * @param step snap 간격
 */
export function snapDistance(distance: number, step: number): number {
  return snapScalar(distance, step, 0);
}
