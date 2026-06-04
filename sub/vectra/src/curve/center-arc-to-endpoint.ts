import type { ArcCommandWritable, CenterArcLike } from '../types';
import { centerArcToEndpointInto } from './center-arc-to-endpoint-into';

/**
 * center form arc를 SVG 호환 endpoint form으로 변환한 새 object를 반환한다.
 *
 * `centerArcToEndpointInto`의 allocating companion. 결과는 새 plain
 * `ArcCommandWritable` object이다 (`kind: 'arc'`, `rx`, `ry`, `xRotation`, `largeArc`,
 * `sweep`, `x`, `y` 모두 포함).
 *
 * - `x`, `y`는 endAngle 위치의 점이다. `from(시작점)`은 caller가 별도 관리한다.
 * - `largeArc`는 sweep angle의 절댓값이 π 이상인지로 결정한다.
 * - `sweep`은 center arc의 sweep flag를 그대로 옮긴다.
 * - degenerate (rx <= 0 또는 ry <= 0)이면 endpoint는 center 좌표가 된다.
 *
 * @param centerArc center form arc input
 * @returns 새 plain `ArcCommandWritable` object
 */
export function centerArcToEndpoint(centerArc: CenterArcLike): ArcCommandWritable {
  return centerArcToEndpointInto(
    {
      kind: 'arc',
      rx: 0,
      ry: 0,
      xRotation: 0,
      largeArc: false,
      sweep: false,
      x: 0,
      y: 0,
    },
    centerArc
  );
}
