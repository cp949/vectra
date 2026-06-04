import type { PathCommand } from '../types/index';
import { normalizeCommandsInto } from './normalize-commands-into';

/**
 * commands를 정규화한 새 PathCommand[] 배열을 반환한다.
 *
 * 첫 command가 MoveCommand가 아니면 원점(0, 0)으로의 암묵적 MoveCommand를 삽입한다.
 * 입력 command object는 그대로 재사용한다(shallow copy 없음).
 * 성능 최적화가 필요하면 `normalizeCommandsInto`를 사용한다.
 *
 *
 * caller-responsibility 가정은 `normalizeCommandsInto`와 동일하다.
 * @param commands 정규화할 입력 command sequence
 * @returns 새로 만든 정규화된 PathCommand 배열
 */
export function normalizeCommands(commands: readonly PathCommand[]): PathCommand[] {
  return normalizeCommandsInto([], commands);
}
