import type { ArcCommand, EndpointArcCorrectionWritable, XYInput } from '../types';
import { correctEndpointArcRadiiInto } from './correct-endpoint-arc-radii-into';

/**
 * SVG 명세 F.6.6.3에 따라 endpoint arc의 radius를 scale 보정한 결과를 새 object로 반환한다.
 *
 * `correctEndpointArcRadiiInto`의 allocating companion. 결과는 새 plain
 * `EndpointArcCorrectionWritable` object(`{ rx, ry }`)이다.
 *
 * - from→arc endpoint 거리가 (rx, ry) 타원이 표현 가능한 범위를 넘으면
 *   rx와 ry를 동일 비율(`sqrt(lambda)`)로 확대한다. 표현 가능한 범위 내라면 원본 값을 그대로 둔다.
 * - 둘 중 하나라도 0 이하이면 원본 값을 그대로 둔다 (degenerate).
 * - 거리는 `arc.xRotation` 회전 좌표계에서 측정한다 (F.6.5 midpoint 변환). 따라서
 *   `xRotation`이 NaN/Infinity이면 cosPhi/sinPhi 경로로 NaN이 전파된다.
 *
 * @param from arc 시작점 (current point)
 * @param arc endpoint 형식의 ArcCommand
 * @returns 새 plain `EndpointArcCorrectionWritable` object
 */
export function correctEndpointArcRadii(from: XYInput, arc: ArcCommand): EndpointArcCorrectionWritable {
  return correctEndpointArcRadiiInto({ rx: 0, ry: 0 }, from, arc);
}
