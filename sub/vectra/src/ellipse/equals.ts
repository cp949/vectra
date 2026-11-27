import type { Ellipse } from '../types/flat-shapes.internal';

/**
 * 두 ellipse가 정확히 같은지 비교한다.
 *
 * center의 x/y, rx, ry 모두 `===` 비교한다.
 *
 * @param a 비교할 첫 번째 ellipse
 * @param b 비교할 두 번째 ellipse
 */
export function equals(a: Ellipse, b: Ellipse): boolean {
  const ax = a.cx;
  const ay = a.cy;
  const bx = b.cx;
  const by = b.cy;

  return ax === bx && ay === by && a.rx === b.rx && a.ry === b.ry;
}
