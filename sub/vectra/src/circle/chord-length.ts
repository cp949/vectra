import { readCircleRadius } from '../internal/circle';
import type { CircleLike } from '../types';

/**
 * circle에서 중심각 centralAngle에 대응하는 현의 길이를 반환한다.
 *
 * centralAngle은 radian 단위이며 부호를 무시한다 (Math.abs 적용).
 * empty circle (radius <= 0)이면 0을 반환한다. 반환값 범위는 [0, 2 * radius]이다.
 *
 * @param circle 현의 길이를 계산할 circle
 * @param centralAngle 현에 대응하는 중심각 (radian, 부호 무시)
 */
export function chordLength(circle: CircleLike, centralAngle: number): number {
  const r = readCircleRadius(circle);
  if (r <= 0) return 0;
  return 2 * r * Math.sin(Math.abs(centralAngle) / 2);
}
