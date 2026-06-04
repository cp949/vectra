import { readEllipseCenter, readEllipseRadiusX, readEllipseRadiusY } from '../internal/ellipse';
import { readX, readY } from '../internal/xy';
import type { EllipseLike, XYInput } from '../types';

/**
 * point가 ellipse 내부 또는 경계 위에 있으면 true를 반환한다.
 *
 * closed boundary 기준: ((px-cx)/rx)² + ((py-cy)/ry)² <= 1.
 * radiusX <= 0 또는 radiusY <= 0인 empty ellipse는 항상 false를 반환한다.
 *
 * @param ellipse 포함 여부를 검사할 ellipse
 * @param point 검사할 point
 */
export function containsPoint(ellipse: EllipseLike, point: XYInput): boolean {
  const rx = readEllipseRadiusX(ellipse);
  const ry = readEllipseRadiusY(ellipse);

  // empty ellipse는 point를 포함하지 않는다
  if (rx <= 0 || ry <= 0) return false;

  const cx = readX(readEllipseCenter(ellipse));
  const cy = readY(readEllipseCenter(ellipse));
  const px = readX(point);
  const py = readY(point);

  const dx = (px - cx) / rx;
  const dy = (py - cy) / ry;
  return dx * dx + dy * dy <= 1;
}
