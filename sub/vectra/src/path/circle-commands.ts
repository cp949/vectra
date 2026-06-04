import type { CircleLike, PathCommand } from '../types/index';
import { circleCommandsInto, type EllipseArcOptions } from './circle-commands-into';

/**
 * circle을 move(right-most point) + 4 cubic + close, 총 6 command로 만들어 새 PathCommand[] 배열로 반환한다.
 *
 * 기본 clockwise = true (SVG y-down). radius <= 0이면 degenerate circle command가 push된다.
 * invalid numeric(NaN, Inf)은 throw 없이 그대로 전파한다.
 * 성능 최적화가 필요하면 `circleCommandsInto`를 사용한다.
 *
 *
 * tolerance/iteration option 정책은 `circleCommandsInto`와 동일하다.
 * @param circle 변환할 circle input
 * @param options clockwise, startAngle 옵션
 * @returns 새로 만든 PathCommand 배열
 */
export function circleCommands(circle: CircleLike, options?: EllipseArcOptions): PathCommand[] {
  return circleCommandsInto([], circle, options);
}
