import type { PathCommand } from '../types/index';
import { type RemoveCollinearOptions, removeCollinearCommandsInto } from './remove-collinear-commands-into';

/**
 * 연속한 LineCommand 사이의 collinear 중간점을 제거한 새 PathCommand[] 배열을 반환한다.
 *
 * 세 점 A→B→C에서 B(LineCommand)의 turn angle이 angleTolerance 이내이면 B를 제거한다.
 * Bezier/arc/Close는 그대로 통과한다.
 * zero-length LineCommand(시작점 == 끝점)는 collinear로 간주되어 제거된다.
 * invalid numeric(NaN, Inf)은 throw 없이 전파한다.
 * Absolute-only 정책 전제. relative command 처리는 caller / SVG adapter 담당이다.
 * 입력 LineCommand object는 그대로 재사용한다 (제거되지 않는 command는 reference 그대로 push).
 * 성능 최적화가 필요하면 `removeCollinearCommandsInto`를 사용한다.
 *
 * @param commands collinear 제거할 입력 command sequence
 * @param options collinear 판정 옵션 (angleTolerance 기본값 1e-10)
 * @returns 새로 만든 PathCommand 배열
 */
export function removeCollinearCommands(
  commands: readonly PathCommand[],
  options?: RemoveCollinearOptions
): PathCommand[] {
  return removeCollinearCommandsInto([], commands, options);
}
