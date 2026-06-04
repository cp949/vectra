import type { PathCommand } from '../types/index';

/**
 * commands의 `index`번째 command를 반환한다.
 *
 * `commands[index]` 직접 접근의 타입 안전 단일 조회 helper다. 다음 입력은 모두
 * `undefined`를 반환한다.
 *
 * - empty path
 * - `index < 0`
 * - `index >= commands.length`
 * - non-integer / NaN / Infinity index
 *
 * JavaScript Array의 음수 index 자동 wrap은 사용하지 않는다.
 *
 * @param commands command를 읽을 path command sequence
 * @param index 읽을 command의 0-based index
 */
export function commandAt(commands: readonly PathCommand[], index: number): PathCommand | undefined {
  if (!Number.isInteger(index) || index < 0 || index >= commands.length) {
    return undefined;
  }
  return commands[index];
}
