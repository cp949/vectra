import type { PathCommand } from '../types/index';

/**
 * commands의 각 command에 대해 visitor를 순서대로 호출한다.
 * visitor는 command와 index를 받는다.
 *
 * @param commands - 순회할 command sequence
 * @param visitor - 각 command에 대해 호출될 callback
 */
export function forEachCommand(
  commands: readonly PathCommand[],
  visitor: (command: PathCommand, index: number) => void
): void {
  for (let i = 0; i < commands.length; i++) {
    visitor(commands[i], i);
  }
}
