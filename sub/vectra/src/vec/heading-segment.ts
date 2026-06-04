import { readX, readY } from '../internal/xy';
import type { XYInput } from '../types';

/**
 * 두 점 a에서 b 방향의 각도(radian)를 반환한다.
 *
 * `Math.atan2(b.y - a.y, b.x - a.x)`. range: (-π, π].
 * zero-length vector(a === b)이면 0을 반환한다.
 *
 * @param a 시작 점
 * @param b 끝 점
 */
export function headingSegment(a: XYInput, b: XYInput): number {
  const dx = readX(b) - readX(a);
  const dy = readY(b) - readY(a);

  if (dx === 0 && dy === 0) return 0;

  return Math.atan2(dy, dx);
}
