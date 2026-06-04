import type { ArcCommand, CenterArcWritable, XYInput } from '../types';
import { endpointArcToCenterInto } from './endpoint-arc-to-center-into';

/**
 * SVG 명세 F.6.5에 따라 endpoint arc를 center form으로 변환한 새 object를 반환한다.
 *
 * `endpointArcToCenterInto`의 allocating companion. 결과는 새 plain `CenterArcWritable`이다.
 *
 * - from == arc.endpoint 이면 zero-length(sweep 0) arc로 처리한다.
 *   `startAngle = endAngle = 0`, `cx/cy = from`, `rx/ry = arc.rx/arc.ry`를 기록한다.
 *   결과는 NaN 없이 항상 유효한 struct이다.
 * - rx 또는 ry가 0 이하면 degenerate로 처리해 center를 from/to 중점으로, sweep 0 arc로 기록한다.
 *   이 경우 `xRotation`은 `arc.xRotation` 원본값을 그대로 보존한다.
 * - F.6.6.3 radius correction은 내부에서 자동 적용한다.
 * - sweep flag = true(시계 방향, SVG 정의)이면 결과 `endAngle >= startAngle`이다.
 *
 * angle convention: `endAngle - startAngle`의 부호 = `(sweep ? +1 : -1)`.
 *
 *
 * caller-responsibility 가정은 `endpointArcToCenterInto`와 동일하다.
 * @param from arc 시작점 (current point)
 * @param arc endpoint 형식의 ArcCommand
 * @returns 새 `CenterArcWritable` plain object
 */
export function endpointArcToCenter(from: XYInput, arc: ArcCommand): CenterArcWritable {
  return endpointArcToCenterInto(
    { cx: 0, cy: 0, rx: 0, ry: 0, xRotation: 0, startAngle: 0, endAngle: 0, sweep: false },
    from,
    arc
  );
}
