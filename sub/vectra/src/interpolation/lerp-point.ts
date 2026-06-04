import type { XYInput } from '../types';
import { lerpPointInto } from './lerp-point-into';

/**
 * a와 b 사이의 선형 보간 좌표를 새 object로 반환한다.
 *
 * `t`를 clamp하지 않으며 extrapolation을 허용한다.
 * a, b의 x/y와 t는 finite number여야 한다.
 *
 * @param a 보간 시작 좌표
 * @param b 보간 끝 좌표
 * @param t 보간 비율. clamp 없음, extrapolation 허용
 */
export function lerpPoint(a: XYInput, b: XYInput, t: number): { x: number; y: number } {
  return lerpPointInto({ x: 0, y: 0 }, a, b, t);
}
