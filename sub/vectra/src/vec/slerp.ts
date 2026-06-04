import type { XYInput, XYObjectWritable } from '../types';
import { slerpInto } from './slerp-into';

/**
 * 두 unit vector a, b 사이를 구면 보간(slerp)한 결과를 새 object로 반환한다.
 *
 * t = 0이면 a, t = 1이면 b 방향의 unit vector를 반환한다.
 * a 또는 b가 zero-vector이면 RangeError를 던진다.
 *
 * 전제 조건: a와 b는 unit vector여야 한다 (caller 책임).
 * a와 b가 거의 같은 방향이거나 정반대인 경우 선형 보간(lerp)으로 fallback한다.
 *
 * @param a 시작 unit vector (t = 0)
 * @param b 끝 unit vector (t = 1)
 * @param t 보간 계수
 */
export function slerp(a: XYInput, b: XYInput, t: number): XYObjectWritable {
  return slerpInto({ x: 0, y: 0 }, a, b, t);
}
