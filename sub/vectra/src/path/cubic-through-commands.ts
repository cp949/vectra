import type { CubicThroughOptions, PathCommand, XYInput } from '../types/index';
import { cubicThroughCommandsInto } from './cubic-through-commands-into';

/**
 * from → to를 잇는 cubic Bezier가 through 점을 통과하도록 move + cubic 2 command를 만들어 새 PathCommand[] 배열로 반환한다.
 *
 * `options.controlScale === 1`이면 cubic을 parameter `t`에서 evaluate했을 때 through 점을 정확히 통과한다.
 * `controlScale`이 `1`이 아니면 control handle 길이 배율로 작용해 휘어짐 강도만 조절한다.
 * `options.t === 0` 또는 `options.t === 1`이면 계수 계산에서 분모가 0이 되어 NaN/Infinity로 흐른다.
 *
 * degenerate(from == to)인 경우에도 분기 없이 그대로 cubic을 구성한다.
 * non-finite 좌표/옵션은 그대로 흘려 NaN/Infinity가 control point에 전파된다 (path invalid numeric pass-through).
 * 성능 최적화가 필요하면 `cubicThroughCommandsInto`를 사용한다.
 *
 * @param from 시작점
 * @param through 통과점
 * @param to 끝점
 * @param options t1, t2 파라미터 옵션
 * @returns 새로 만든 PathCommand 배열
 */
export function cubicThroughCommands(
  from: XYInput,
  through: XYInput,
  to: XYInput,
  options?: CubicThroughOptions
): PathCommand[] {
  return cubicThroughCommandsInto([], from, through, to, options);
}
