import { readEllipseRadiusX, readEllipseRadiusY } from '../internal/ellipse';
import type { EllipseLike } from '../types';

/**
 * ellipse의 넓이를 반환한다.
 *
 * empty ellipse(radiusX <= 0 || radiusY <= 0)이면 0을 반환한다.
 * 그 외에는 π * radiusX * radiusY로 계산한다.
 *
 * @param ellipse 넓이를 계산할 ellipse
 */
export function area(ellipse: EllipseLike): number {
  const rx = readEllipseRadiusX(ellipse);
  const ry = readEllipseRadiusY(ellipse);

  // empty ellipse: 넓이 없음
  if (rx <= 0 || ry <= 0) {
    return 0;
  }

  return Math.PI * rx * ry;
}
