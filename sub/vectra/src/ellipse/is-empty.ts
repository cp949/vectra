import type { Ellipse } from '../types/flat-shapes.internal';

/**
 * ellipse가 비어 있는지 확인한다.
 *
 * rx <= 0 또는 ry <= 0이면 empty로 간주한다.
 *
 * @param ellipse 확인할 ellipse
 */
export function isEmpty(ellipse: Ellipse): boolean {
  const rx = ellipse.rx;
  const ry = ellipse.ry;

  return rx <= 0 || ry <= 0;
}
