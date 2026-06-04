import type { PathCommand } from '../types/index';

/**
 * commands 배열에서 MoveCommand 수를 세어 subpath 수를 반환한다.
 * commands가 비어 있으면 0을 반환한다.
 *
 * @param commands - 대상 command sequence
 */
export function subpathCount(commands: readonly PathCommand[]): number {
  let count = 0;
  for (const cmd of commands) {
    if (cmd.kind === 'move') {
      count++;
    }
  }
  return count;
}
