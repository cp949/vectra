import type { PathCommand } from '../types/index';
import { type SanitizeCommandsOptions, sanitizeCommandsInto } from './sanitize-commands-into';

/**
 * commands를 정리한 새 PathCommand[] 배열을 반환한다.
 *
 * cleanup canonical facade. options 조합으로 duplicate / collinear 제거를 켜고 끈다.
 * 옵션이 모두 false / 미지정이면 입력 command를 그대로 복사한다.
 *
 * - `removeDuplicates`: drawing command 끝점이 직전 current point와 `|Δx|, |Δy| ≤ tolerance`이면
 *   그 command를 제거한다. MoveCommand는 subpath 경계라 제외하고, CloseCommand는 보존한다.
 * - `removeCollinear`: collinear LineCommand 중간점을 제거한다. tolerance는 angleTolerance(radian)다.
 * - 두 옵션 동시 true: duplicate 제거 → collinear 제거 순서로 적용한다.
 * - empty commands → 빈 배열.
 * - non-finite 좌표는 비교식 false로 떨어져 그대로 보존된다. throw 없음.
 *
 * topology / self-intersection / subpath reorder 같은 topology-level cleanup은 수행하지 않는다.
 * 성능 최적화가 필요하면 `sanitizeCommandsInto`를 사용한다.
 *
 * @param commands 정리할 입력 command sequence (absolute 전제)
 * @param options removeDuplicates / removeCollinear / tolerance
 * @returns 새로 만든 PathCommand 배열
 */
export function sanitizeCommands(commands: readonly PathCommand[], options?: SanitizeCommandsOptions): PathCommand[] {
  return sanitizeCommandsInto([], commands, options);
}
