import type { PathCommand, XYInput } from '../types/index';
import { lineCommandsInto } from './line-commands-into';

/**
 * from→to 직선을 move + line 2 command로 만들어 새 PathCommand[] 배열로 반환한다.
 *
 * 좌표는 모두 절대좌표다.
 * invalid numeric(NaN, Inf)은 throw 없이 그대로 전파한다.
 * 성능 최적화가 필요하면 `lineCommandsInto`를 사용한다.
 *
 * @param from 시작점 (XYLike 또는 XYTuple)
 * @param to 끝점 (XYLike 또는 XYTuple)
 * @returns 새로 만든 PathCommand 배열
 */
export function lineCommands(from: XYInput, to: XYInput): PathCommand[] {
  return lineCommandsInto([], from, to);
}
