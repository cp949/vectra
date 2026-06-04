import { readX, readY } from '../internal/xy';
import type { ArcCommand, EndpointArcCorrectionWritable, XYInput } from '../types';

/**
 * SVG 명세 F.6.6.3에 따라 endpoint arc의 radius를 scale 보정한 결과를 out에 기록하고 out을 반환한다.
 *
 * from→arc endpoint 거리가 (rx, ry) 타원이 표현 가능한 범위를 넘으면
 * rx와 ry를 동일 비율(`sqrt(lambda)`)로 확대한다. 표현 가능한 범위 내라면 원본 값을 그대로 둔다.
 * 둘 중 하나라도 0 이하이면 원본 값을 그대로 둔다 (degenerate).
 *
 * 거리는 `arc.xRotation` 회전 좌표계에서 측정한다 (F.6.5 midpoint 변환). 따라서
 * `xRotation`이 NaN/Infinity이면 cosPhi/sinPhi 경로로 NaN이 전파된다.
 *
 * @param out 보정된 rx/ry를 기록할 writable output
 * @param from arc 시작점 (current point)
 * @param arc endpoint 형식의 ArcCommand
 * @returns out
 */
export function correctEndpointArcRadiiInto<Out extends EndpointArcCorrectionWritable>(
  out: Out,
  from: XYInput,
  arc: ArcCommand
): Out {
  const rx = arc.rx;
  const ry = arc.ry;

  // degenerate radius는 보정 없이 그대로 기록한다.
  if (!(rx > 0) || !(ry > 0)) {
    out.rx = rx;
    out.ry = ry;
    return out;
  }

  const fromX = readX(from);
  const fromY = readY(from);

  // F.6.5 step 1: midpoint를 좌표계 회전 후 변환
  const cosPhi = Math.cos(arc.xRotation);
  const sinPhi = Math.sin(arc.xRotation);
  const dx = (fromX - arc.x) * 0.5;
  const dy = (fromY - arc.y) * 0.5;
  const x1p = cosPhi * dx + sinPhi * dy;
  const y1p = -sinPhi * dx + cosPhi * dy;

  // F.6.6.3 lambda 계산: (x1'/rx)^2 + (y1'/ry)^2
  const lambda = (x1p * x1p) / (rx * rx) + (y1p * y1p) / (ry * ry);

  if (lambda > 1) {
    const scale = Math.sqrt(lambda);
    out.rx = rx * scale;
    out.ry = ry * scale;
  } else {
    out.rx = rx;
    out.ry = ry;
  }

  return out;
}
