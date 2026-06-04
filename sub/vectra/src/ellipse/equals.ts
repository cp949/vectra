import { readEllipseCenter, readEllipseRadiusX, readEllipseRadiusY } from '../internal/ellipse';
import { readX, readY } from '../internal/xy';
import type { EllipseLike } from '../types';

/**
 * 두 ellipse가 정확히 같은지 비교한다.
 *
 * center의 x/y, radiusX, radiusY 모두 `===` 비교한다.
 *
 * @param a 비교할 첫 번째 ellipse
 * @param b 비교할 두 번째 ellipse
 */
export function equals(a: EllipseLike, b: EllipseLike): boolean {
  const ax = readX(readEllipseCenter(a));
  const ay = readY(readEllipseCenter(a));
  const bx = readX(readEllipseCenter(b));
  const by = readY(readEllipseCenter(b));

  return (
    ax === bx &&
    ay === by &&
    readEllipseRadiusX(a) === readEllipseRadiusX(b) &&
    readEllipseRadiusY(a) === readEllipseRadiusY(b)
  );
}
