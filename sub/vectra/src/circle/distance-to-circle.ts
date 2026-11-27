import type { Circle } from '../types/flat-shapes.internal';
import { hypot2 } from '../internal/numeric';

/**
 * 두 closed disk 간 부호 없는 최단 거리를 반환한다. overlap 시 0을 반환한다.
 *
 * empty circle (radius ≤ 0)이면 그 circle을 center point로 취급한다. 즉 radius를
 * 0으로 clamp해 계산한다.
 *
 * 반환값은 항상 0 이상이다.
 *
 * @param a 거리 계산에 사용할 첫 번째 circle
 * @param b 거리 계산에 사용할 두 번째 circle
 */
export function distanceToCircle(a: Circle, b: Circle): number {
  const ra = Math.max(a.r, 0);
  const rb = Math.max(b.r, 0);

  const ax = a.cx;
  const ay = a.cy;
  const bx = b.cx;
  const by = b.cy;

  const dx = bx - ax;
  const dy = by - ay;
  const centerDist = hypot2(dx, dy);

  // overlap이면 0, 분리되면 양수 거리
  const d = centerDist - ra - rb;
  return d > 0 ? d : 0;
}
