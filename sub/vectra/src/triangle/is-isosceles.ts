import type { Triangle } from '../types/flat-shapes.internal';
import { hypot2 } from '../internal/numeric';

/**
 * triangle의 두 변 길이가 epsilon 이내로 같으면 true를 반환한다.
 *
 * equilateral triangle은 항상 isosceles이다.
 * epsilon 기본값은 0(정확한 같음)이다. epsilon은 절대 변 길이 차이이므로 좌표 규모에 맞게 조정한다.
 * degenerate triangle은 별도로 검사하지 않는다.
 *
 * @param triangle 검사할 triangle
 * @param epsilon 변 길이 절대 허용 오차 (기본값 0)
 */
export function isIsosceles(triangle: Triangle, epsilon = 0): boolean {
  const { x1: ax, y1: ay, x2: bx, y2: by, x3: cx, y3: cy } = triangle;
  const ab = hypot2(bx - ax, by - ay);
  const bc = hypot2(cx - bx, cy - by);
  const ca = hypot2(ax - cx, ay - cy);

  return Math.abs(ab - bc) <= epsilon || Math.abs(bc - ca) <= epsilon || Math.abs(ca - ab) <= epsilon;
}
