import { readEllipseRadiusX, readEllipseRadiusY } from '../internal/ellipse';
import type { EllipseLike } from '../types';

/**
 * ellipse가 비어 있는지 확인한다.
 *
 * radiusX <= 0 또는 radiusY <= 0이면 empty로 간주한다.
 *
 * @param ellipse 확인할 ellipse
 */
export function isEmpty(ellipse: EllipseLike): boolean {
  const rx = readEllipseRadiusX(ellipse);
  const ry = readEllipseRadiusY(ellipse);

  return rx <= 0 || ry <= 0;
}
