import { readCircleRadius } from '../internal/circle';
import type { CircleLike } from '../types';

/**
 * circle에서 중심각 centralAngle에 대응하는 활꼴 넓이를 반환한다.
 *
 * 활꼴 넓이 = 부채꼴 넓이 - 삼각형 넓이 = 0.5 * r² * (|θ| - sin|θ|).
 * centralAngle은 radian 단위이며 부호를 무시한다 (Math.abs 적용).
 * θ > π이면 sin|θ| < 0이 되어 넓이가 부채꼴보다 커진다(major segment 정상).
 * empty circle (radius <= 0)이면 0을 반환한다. 반환값은 항상 0 이상이다.
 *
 * @param circle 활꼴 넓이를 계산할 circle
 * @param centralAngle 활꼴에 대응하는 중심각 (radian, 부호 무시)
 */
export function segmentArea(circle: CircleLike, centralAngle: number): number {
  const r = readCircleRadius(circle);
  if (r <= 0) return 0;
  return 0.5 * r * r * (Math.abs(centralAngle) - Math.sin(Math.abs(centralAngle)));
}
