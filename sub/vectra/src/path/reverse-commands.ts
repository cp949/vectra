import type { PathCommand } from '../types/index';
import { reverseCommandsInto } from './reverse-commands-into';

/**
 * commands를 반전한 새 PathCommand[] 배열을 반환한다.
 *
 * subpath 순서와 내부 command를 모두 반전한다.
 * arc sweep flag도 flip된다.
 * 결과 command는 새 object다. 입력 command reference는 보존하지 않으므로
 * 결과의 command를 mutate해도 입력 sequence는 안전하다.
 * 성능 최적화가 필요하면 `reverseCommandsInto`를 사용한다.
 *
 *
 * degenerate/empty 입력 처리 정책은 `reverseCommandsInto`와 동일하다.
 * clamp/정규화/fallback 정책은 `reverseCommandsInto`와 동일하다.
 * caller-responsibility 가정은 `reverseCommandsInto`와 동일하다.
 * @param commands 반전할 입력 command sequence
 * @returns 새로 만든 반전된 PathCommand 배열
 */
export function reverseCommands(commands: readonly PathCommand[]): PathCommand[] {
  return reverseCommandsInto([], commands);
}
