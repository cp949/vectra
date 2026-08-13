/**
 * 두 좌표 사이 유클리드 거리를 반환한다.
 *
 * internal 전용 helper이며 finite 검증 없이 Math.hypot을 그대로 사용한다.
 *
 * @param ax 시작 x 좌표
 * @param ay 시작 y 좌표
 * @param bx 끝 x 좌표
 * @param by 끝 y 좌표
 */
export function pointDist(ax: number, ay: number, bx: number, by: number): number {
  return Math.hypot(bx - ax, by - ay);
}

/**
 * point (qx, qy)와 segment (ax,ay)→(bx,by) 사이 최단 거리 제곱을 반환한다.
 *
 * zero-length segment는 point와 a 사이 거리 제곱을 반환한다.
 *
 * @param ax segment 시작 x 좌표
 * @param ay segment 시작 y 좌표
 * @param bx segment 끝 x 좌표
 * @param by segment 끝 y 좌표
 * @param qx 거리 측정 대상 point의 x 좌표
 * @param qy 거리 측정 대상 point의 y 좌표
 */
export function segDistSq(ax: number, ay: number, bx: number, by: number, qx: number, qy: number): number {
  const dx = bx - ax;
  const dy = by - ay;
  const lenSq = dx * dx + dy * dy;
  const px = qx - ax;
  const py = qy - ay;
  if (lenSq === 0) return px * px + py * py;
  const t = Math.max(0, Math.min(1, (px * dx + py * dy) / lenSq));
  const cx = t * dx - px;
  const cy = t * dy - py;
  return cx * cx + cy * cy;
}

/**
 * point (qx, qy)의 segment (ax,ay)→(bx,by) 위 clamped projection parameter t를 반환한다.
 *
 * t는 [0, 1]로 clamp되며, zero-length segment는 0을 반환한다.
 * 사용처가 이 t로 closest 좌표(ax + t*dx, ay + t*dy)와 거리 제곱을 한 번에 계산할 수 있다.
 *
 * @param ax segment 시작 x 좌표
 * @param ay segment 시작 y 좌표
 * @param bx segment 끝 x 좌표
 * @param by segment 끝 y 좌표
 * @param qx projection 대상 point의 x 좌표
 * @param qy projection 대상 point의 y 좌표
 */
export function segClampedT(ax: number, ay: number, bx: number, by: number, qx: number, qy: number): number {
  const dx = bx - ax;
  const dy = by - ay;
  const lenSq = dx * dx + dy * dy;
  if (lenSq === 0) return 0;
  return Math.max(0, Math.min(1, ((qx - ax) * dx + (qy - ay) * dy) / lenSq));
}
