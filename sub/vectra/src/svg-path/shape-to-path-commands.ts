/**
 * structural SVG shape attribute object → 새 canonical absolute PathCommand[] bridge.
 *
 * domain barrel(./index)을 import하지 않는다.
 */

import type { PathCommand, SvgShapeLike } from '../types/index';
import { shapeToPathCommandsInto } from './shape-to-path-commands-into';

/**
 * structural SVG shape attribute object를 새 canonical absolute `PathCommand[]`로 만들어 반환한다.
 *
 * discriminated union `SvgShapeLike`만 받으며 DOM element, `<path d="">` data string,
 * `<text>`, `<image>`, `<use>`, `<symbol>`, `<marker>`, transform/style attribute는 받지 않는다.
 *
 * 각 shape별 동작은 `shapeToPathCommandsInto`와 같다. 반환 배열은 새 `PathCommand[]`이며
 * caller-provided output 재사용이 필요하면 `shapeToPathCommandsInto`를 사용한다.
 *
 * invalid numeric(NaN, Infinity, ±0 degenerate)은 throw 없이 그대로 전파한다.
 *
 * rect 예외 정책은 `shapeToPathCommandsInto`와 같다.
 *
 * - `rect.rx`/`rect.ry`가 NaN 또는 음수이면 `> 0` 비교가 false라 sharp rect로 fallback된다.
 * - 음수 `width`/`height`는 validation 없이 그대로 사용한다.
 *
 * input `shape`와 `shape.points`(polyline/polygon)는 함수가 mutate하지 않는다.
 * polyline/polygon의 점이 invalid `XYInput`(예: `as any`로 우회한 `null`)이면 internal
 * `readX`/`readY` 동작에 위임된다.
 *
 * `SvgShapeLike`는 닫힌 union이라 default fallback이 없다. 미정의 kind를 type 단언으로 우회해
 * 호출하면 runtime exception이 난다.
 *
 * @param shape 변환할 structural SVG shape input
 * @returns 새로 만든 canonical absolute PathCommand 배열
 */
export function shapeToPathCommands(shape: SvgShapeLike): PathCommand[] {
  return shapeToPathCommandsInto([], shape);
}
