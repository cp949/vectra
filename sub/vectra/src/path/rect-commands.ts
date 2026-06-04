import type { PathCommand, RectLike } from '../types/index';
import { rectCommandsInto } from './rect-commands-into';

/**
 * rect를 move + 3 line + close, 총 5 command로 만들어 새 PathCommand[] 배열로 반환한다.
 *
 * invalid numeric(NaN, Inf)은 throw 없이 그대로 전파한다.
 * 성능 최적화가 필요하면 `rectCommandsInto`를 사용한다.
 *
 *
 * degenerate/empty 입력 처리 정책은 `rectCommandsInto`와 동일하다.
 * @param rect 변환할 rect input
 * @returns 새로 만든 PathCommand 배열
 */
export function rectCommands(rect: RectLike): PathCommand[] {
  return rectCommandsInto([], rect);
}
