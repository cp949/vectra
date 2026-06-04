/**
 * center arc 계산에서 사용하는 내부 helper.
 *
 * - degenerate 판단: rx <= 0 또는 ry <= 0
 * - center form `t ∈ [0,1]`을 angle로 매핑
 * - rotated ellipse 위 한 점/접선 좌표 계산
 *
 * 모든 helper는 internal로만 사용되며 public 함수가 직접 호출한다.
 */

/** rx 또는 ry가 0(또는 음수)이면 degenerate arc로 처리한다. */
export function isDegenerateRadii(rx: number, ry: number): boolean {
  return !(rx > 0) || !(ry > 0);
}

/**
 * center arc의 t ∈ [0,1]에 대응하는 angle을 반환한다.
 *
 * t는 startAngle(0)과 endAngle(1) 사이를 선형 보간한다.
 * sweep 방향 정책은 startAngle/endAngle의 대소 관계에 그대로 반영되어 있으므로
 * 여기서는 단순 선형 보간만 한다.
 */
export function angleAtT(startAngle: number, endAngle: number, t: number): number {
  return startAngle + (endAngle - startAngle) * t;
}

/**
 * 회전된 ellipse 위 (cx, cy) 중심, 반지름 (rx, ry), xRotation 회전을 가진
 * 좌표를 (x, y) 형태로 [x, y] tuple에 채워 반환한다.
 *
 * 수식: x = cx + cosφ·rx·cosθ - sinφ·ry·sinθ
 *       y = cy + sinφ·rx·cosθ + cosφ·ry·sinθ
 */
export function ellipsePoint(
  cx: number,
  cy: number,
  rx: number,
  ry: number,
  xRotation: number,
  theta: number,
  outXY: [number, number]
): void {
  const cosPhi = Math.cos(xRotation);
  const sinPhi = Math.sin(xRotation);
  const cosTheta = Math.cos(theta);
  const sinTheta = Math.sin(theta);
  outXY[0] = cx + cosPhi * rx * cosTheta - sinPhi * ry * sinTheta;
  outXY[1] = cy + sinPhi * rx * cosTheta + cosPhi * ry * sinTheta;
}

/**
 * 회전된 ellipse 위 한 점에서의 dP/dθ (theta에 대한 derivative)를 반환한다.
 *
 * 수식: dx/dθ = -cosφ·rx·sinθ - sinφ·ry·cosθ
 *       dy/dθ = -sinφ·rx·sinθ + cosφ·ry·cosθ
 *
 * `arcTangentAtInto`는 dP/dt = dP/dθ · (endAngle - startAngle)이지만,
 * 정규화하면 부호만 의미가 있으므로 (endAngle - startAngle)의 부호를 곱해서 반환한다.
 */
export function ellipseDerivative(
  rx: number,
  ry: number,
  xRotation: number,
  theta: number,
  outXY: [number, number]
): void {
  const cosPhi = Math.cos(xRotation);
  const sinPhi = Math.sin(xRotation);
  const cosTheta = Math.cos(theta);
  const sinTheta = Math.sin(theta);
  outXY[0] = -cosPhi * rx * sinTheta - sinPhi * ry * cosTheta;
  outXY[1] = -sinPhi * rx * sinTheta + cosPhi * ry * cosTheta;
}
