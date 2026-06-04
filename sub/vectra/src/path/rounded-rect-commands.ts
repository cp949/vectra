import type { PathCommand, RectLike } from '../types/index';
import { roundedRectCommandsInto } from './rounded-rect-commands-into';

/**
 * rounded rect를 move + (line + cubic) × 4 + close, 총 10 command로 만들어 새 PathCommand[] 배열로 반환한다.
 *
 * radius는 `Math.max(0, Math.min(radius, width / 2, height / 2))`로 clamp한다.
 * radius <= 0이면 sharp rect command (5 command)를 반환한다.
 * invalid numeric(NaN, Inf)은 throw 없이 그대로 전파한다.
 * 성능 최적화가 필요하면 `roundedRectCommandsInto`를 사용한다.
 *
 * @param rect 변환할 rect input
 * @param radius corner radius
 * @returns 새로 만든 PathCommand 배열
 */
export function roundedRectCommands(rect: RectLike, radius: number): PathCommand[] {
  return roundedRectCommandsInto([], rect, radius);
}
