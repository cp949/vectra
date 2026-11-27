import type { Ellipse } from '../types/flat-shapes.internal';

/**
 * ellipse의 넓이를 반환한다.
 *
 * empty ellipse(rx <= 0 || ry <= 0)이면 0을 반환한다.
 * 그 외에는 π * rx * ry로 계산한다.
 *
 * @param ellipse 넓이를 계산할 ellipse
 */
export function area(ellipse: Ellipse): number {
  const rx = ellipse.rx;
  const ry = ellipse.ry;

  // empty ellipse: 넓이 없음
  if (rx <= 0 || ry <= 0) {
    return 0;
  }

  return Math.PI * rx * ry;
}
