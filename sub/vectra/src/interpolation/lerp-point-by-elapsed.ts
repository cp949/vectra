import type { XYInput } from '../types';
import { lerpPointByElapsedInto } from './lerp-point-by-elapsed-into';

/**
 * raw 경과 시간 진행 비율로 보간한 좌표를 새 object로 반환한다.
 *
 * progress는 raw `elapsed / duration`이며 clamp하지 않는다.
 * 이름에 `clamped`가 없으므로 `elapsed < 0`과 `elapsed > duration` 모두 extrapolation을 허용한다.
 * a, b의 x/y와 elapsed는 finite number여야 한다.
 * `duration`은 finite number이고 `duration > 0`이어야 한다. 그렇지 않으면 RangeError.
 *
 * @param a `elapsed === 0`일 때의 좌표
 * @param b `elapsed === duration`일 때의 좌표
 * @param elapsed 경과 시간
 * @param duration 전체 구간 길이. finite이고 `> 0`이어야 한다
 */
export function lerpPointByElapsed(
  a: XYInput,
  b: XYInput,
  elapsed: number,
  duration: number
): { x: number; y: number } {
  return lerpPointByElapsedInto({ x: 0, y: 0 }, a, b, elapsed, duration);
}
