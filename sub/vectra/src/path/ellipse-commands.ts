import type { Ellipse } from '../types/flat-shapes.internal';
import type { PathCommand } from '../types/index';
import { type EllipseArcOptions, ellipseCommandsInto } from './ellipse-commands-into';

/**
 * ellipse를 move(right-most point) + 4 cubic + close, 총 6 command로 만들어 새 PathCommand[] 배열로 반환한다.
 *
 * 기본 clockwise = true (SVG y-down). radiusX/radiusY <= 0이면 degenerate ellipse command가 push된다.
 * invalid numeric(NaN, Inf)은 throw 없이 그대로 전파한다.
 * 성능 최적화가 필요하면 `ellipseCommandsInto`를 사용한다.
 *
 *
 * tolerance/iteration option 정책은 `ellipseCommandsInto`와 동일하다.
 * @param ellipse 변환할 ellipse input
 * @param options 진행 방향 옵션. 생략하면 `{ clockwise: true }`를 쓴다.
 * @returns 새로 만든 PathCommand 배열
 */
export function ellipseCommands(ellipse: Ellipse, options?: EllipseArcOptions): PathCommand[] {
  return ellipseCommandsInto([], ellipse, options);
}
