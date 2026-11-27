import type { Ellipse } from '../types/flat-shapes.internal';

/**
 * ellipse의 둘레를 Ramanujan second approximation으로 반환한다.
 *
 * empty ellipse(rx <= 0 || ry <= 0)이면 0을 반환한다.
 * 그 외에는 다음 공식으로 계산한다:
 *   h = ((rx - ry) / (rx + ry))²
 *   π * (rx + ry) * (1 + 3h / (10 + √(4 - 3h)))
 *
 * @param ellipse 둘레를 계산할 ellipse
 */
export function circumference(ellipse: Ellipse): number {
  const rx = ellipse.rx;
  const ry = ellipse.ry;

  // empty ellipse: 둘레 없음
  if (rx <= 0 || ry <= 0) {
    return 0;
  }

  // Ramanujan second approximation
  const h = ((rx - ry) / (rx + ry)) ** 2;
  return Math.PI * (rx + ry) * (1 + (3 * h) / (10 + Math.sqrt(4 - 3 * h)));
}
