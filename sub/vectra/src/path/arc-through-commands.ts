import type { PathCommand, XYInput } from '../types/index';
import { arcThroughCommandsInto } from './arc-through-commands-into';

/**
 * from → through → to 3점을 지나는 arc를 move + cubic × N command로 만들어 새 PathCommand[] 배열로 반환한다.
 *
 * 외접원의 두 arc 중 through 점을 지나는 쪽을 선택해 cubic Bezier로 근사한다.
 *
 * degenerate fallback (모두 `Move(from) + Line(to)`로 통일):
 * - cross product가 0인 3점 collinear
 * - `from === to`
 * - `from === through`
 * - `through === to`
 *
 * 세 점이 모두 동일(`from === through === to`)이면 빈 배열을 반환한다.
 * non-finite 좌표는 NaN cross로 collinear 분기를 우회하고 NaN 좌표를 가진 move command 하나만 남는다(throw 없이 전파).
 *
 * 성능 최적화가 필요하면 `arcThroughCommandsInto`를 사용한다.
 *
 * @param from 시작점
 * @param through 통과점
 * @param to 끝점
 * @returns 새로 만든 PathCommand 배열
 */
export function arcThroughCommands(from: XYInput, through: XYInput, to: XYInput): PathCommand[] {
  return arcThroughCommandsInto([], from, through, to);
}
