import type { Ellipse, Point } from '../types/flat-shapes.internal';

/**
 * point가 ellipse 내부 또는 경계 위에 있으면 true를 반환한다.
 *
 * closed boundary 기준: ((px-cx)/rx)² + ((py-cy)/ry)² <= 1.
 * rx <= 0 또는 ry <= 0인 empty ellipse는 항상 false를 반환한다.
 *
 * @param ellipse 포함 여부를 검사할 ellipse
 * @param point 검사할 point
 */
export function containsPoint(ellipse: Ellipse, point: Point): boolean {
  const rx = ellipse.rx;
  const ry = ellipse.ry;

  // empty ellipse는 point를 포함하지 않는다
  if (rx <= 0 || ry <= 0) return false;

  const cx = ellipse.cx;
  const cy = ellipse.cy;
  const px = point.x;
  const py = point.y;

  const dx = (px - cx) / rx;
  const dy = (py - cy) / ry;
  return dx * dx + dy * dy <= 1;
}
