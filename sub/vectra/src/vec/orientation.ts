import { readX, readY } from '../internal/xy';
import type { XYInput } from '../types';

/**
 * 세 점 a, b, c의 방향을 부호 있는 면적으로 반환한다.
 *
 * 양수: CCW(반시계 방향), 0: collinear(일직선), 음수: CW(시계 방향).
 *
 * `cross3(a, b, c)`와 동일한 계산이다. 별도 alias가 아닌 독립 leaf이다.
 *
 * @param a 기준점
 * @param b 두 번째 점
 * @param c 세 번째 점
 */
export function orientation(a: XYInput, b: XYInput, c: XYInput): number {
  const ax = readX(a);
  const ay = readY(a);
  const bx = readX(b);
  const by = readY(b);
  const cx = readX(c);
  const cy = readY(c);

  return (bx - ax) * (cy - ay) - (by - ay) * (cx - ax);
}
