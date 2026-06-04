import { snapScalar } from '../math/snap.internal';

/**
 * angle을 step 단위로 snap한다.
 *
 * radian 입력. validation 없음.
 *
 * @param angle snap할 각도 (radian)
 * @param step snap 간격 (radian)
 */
export function snapAngle(angle: number, step: number): number {
  return snapScalar(angle, step, 0);
}
