import type { PathCommand } from '../types/index';

/**
 * commands 배열의 command 수를 반환한다.
 *
 * @param commands - 대상 command sequence
 */
export function commandCount(commands: readonly PathCommand[]): number {
  return commands.length;
}
