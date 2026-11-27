import type { Ellipse } from '../types/flat-shapes.internal';

/**
 * ellipse의 이심률(eccentricity)을 반환한다.
 *
 * 공식: c = sqrt(max(rx,ry)² - min(rx,ry)²), e = c / max(rx,ry).
 * 원(rx == ry > 0)이면 0을 반환한다.
 * empty ellipse(rx <= 0 || ry <= 0)이면 NaN을 반환한다.
 *
 * @param ellipse 이심률을 계산할 ellipse
 */
export function eccentricity(ellipse: Ellipse): number {
  const rx = ellipse.rx;
  const ry = ellipse.ry;

  // empty ellipse: 이심률 정의 불가
  if (rx <= 0 || ry <= 0) {
    return NaN;
  }

  const major = Math.max(rx, ry);
  const minor = Math.min(rx, ry);
  // 선형 이심거리 c
  const c = Math.sqrt(major * major - minor * minor);
  return c / major;
}
