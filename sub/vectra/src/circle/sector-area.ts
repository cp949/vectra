import { readCircleRadius } from '../internal/circle';
import type { CircleLike } from '../types';

/**
 * circle에서 중심각 centralAngle에 대응하는 부채꼴 넓이를 반환한다.
 *
 * centralAngle은 radian 단위이며 부호를 무시한다 (Math.abs 적용).
 * empty circle (radius <= 0)이면 0을 반환한다.
 *
 * @param circle 부채꼴 넓이를 계산할 circle
 * @param centralAngle 부채꼴에 대응하는 중심각 (radian, 부호 무시)
 */
export function sectorArea(circle: CircleLike, centralAngle: number): number {
  const r = readCircleRadius(circle);
  if (r <= 0) return 0;
  return 0.5 * r * r * Math.abs(centralAngle);
}
