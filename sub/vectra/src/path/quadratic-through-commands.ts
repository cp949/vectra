import type { PathCommand, QuadraticThroughOptions, XYInput } from '../types/index';
import { quadraticThroughCommandsInto } from './quadratic-through-commands-into';

/**
 * from → to를 잇는 quadratic Bezier가 through 점을 통과하도록 move + quadratic 2 command를 만들어 새 PathCommand[] 배열로 반환한다.
 *
 * t = 0 또는 t = 1이면 P1이 ±Infinity/NaN으로 흐른다 (invalid numeric pass-through).
 * degenerate(from == to)인 경우에도 분기 없이 그대로 quadratic을 구성한다.
 * 성능 최적화가 필요하면 `quadraticThroughCommandsInto`를 사용한다.
 *
 * @param from 시작점
 * @param through 통과점
 * @param to 끝점
 * @param options t 파라미터 옵션 (기본값 0.5)
 * @returns 새로 만든 PathCommand 배열
 */
export function quadraticThroughCommands(
  from: XYInput,
  through: XYInput,
  to: XYInput,
  options?: QuadraticThroughOptions
): PathCommand[] {
  return quadraticThroughCommandsInto([], from, through, to, options);
}
