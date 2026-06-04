import { readEllipseCenter, readEllipseRadiusX, readEllipseRadiusY } from '../internal/ellipse';
import { readX, readY } from '../internal/xy';
import type { EllipseLike, PathCommand } from '../types/index';
import { type EllipseArcOptions, ellipseArcInto } from './path-ellipse-arc.internal';

export type { EllipseArcOptions };

/**
 * ellipse를 move(right-most point) + 4 cubic + close, 총 6 command로 out에 기록하고 out을 반환한다.
 *
 * out을 clear(length = 0) 후 push 방식으로 채운다. 시작점은 (cx + rx, cy)이며 4개의
 * 90° cubic Bezier(kappa 근사, rx/ry 각각 적용)로 한 바퀴를 근사한다. 기본 방향은
 * clockwise(SVG y-down). xRotation 미지원(기본 0). degenerate 반경(0, 음수)도
 * validation 없이 그대로 사용한다. `radiusX === radiusY`이면 동일 center/radius
 * `circleCommandsInto` 결과와 같다.
 * invalid numeric(NaN, Inf)은 throw 없이 그대로 command 좌표에 전파한다.
 *
 * @param out command를 기록할 mutable PathCommand 배열
 * @param ellipse 기록할 ellipse ({ center, radiusX, radiusY } object 또는 [center, rx, ry] tuple)
 * @param options 진행 방향 옵션. 생략 시 `clockwise: true`.
 * @returns 기록이 완료된 out (입력과 동일한 참조)
 */
export function ellipseCommandsInto<Out extends PathCommand[]>(
  out: Out,
  ellipse: EllipseLike,
  options?: EllipseArcOptions
): Out {
  const center = readEllipseCenter(ellipse);
  const rx = readEllipseRadiusX(ellipse);
  const ry = readEllipseRadiusY(ellipse);
  return ellipseArcInto(out, readX(center), readY(center), rx, ry, options?.clockwise ?? true);
}
