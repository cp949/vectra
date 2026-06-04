import { readCircleCenter, readCircleRadius } from '../internal/circle';
import { readX, readY } from '../internal/xy';
import type { CircleLike, PathCommand } from '../types/index';
import { type EllipseArcOptions, ellipseArcInto } from './path-ellipse-arc.internal';

export type { EllipseArcOptions };

/**
 * circle을 move(right-most point) + 4 cubic + close, 총 6 command로 out에 기록하고 out을 반환한다.
 *
 * out을 clear(length = 0) 후 push 방식으로 채운다. 시작점은 (cx + r, cy)이며 4개의
 * 90° cubic Bezier(kappa 근사)로 한 바퀴를 근사한다. 기본 방향은 clockwise(SVG y-down).
 * degenerate radius(0, 음수)도 validation 없이 그대로 사용한다.
 * invalid numeric(NaN, Inf)은 throw 없이 그대로 command 좌표에 전파한다.
 *
 * @param out command를 기록할 mutable PathCommand 배열
 * @param circle 기록할 circle ({ center, radius } object 또는 [center, radius] tuple)
 * @param options 진행 방향 옵션. 생략 시 `clockwise: true`.
 * @returns 기록이 완료된 out (입력과 동일한 참조)
 */
export function circleCommandsInto<Out extends PathCommand[]>(
  out: Out,
  circle: CircleLike,
  options?: EllipseArcOptions
): Out {
  const center = readCircleCenter(circle);
  const r = readCircleRadius(circle);
  return ellipseArcInto(out, readX(center), readY(center), r, r, options?.clockwise ?? true);
}
