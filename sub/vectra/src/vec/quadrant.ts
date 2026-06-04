import { readX, readY } from '../internal/xy';
import type { XYInput } from '../types';

/**
 * 벡터가 위치한 사분면 번호를 반환한다.
 *
 * x 또는 y 중 하나라도 0이면(축 위) 0을 반환한다.
 * 사분면 번호는 수학 관례를 따른다:
 * - 1: x > 0, y > 0
 * - 2: x < 0, y > 0
 * - 3: x < 0, y < 0
 * - 4: x > 0, y < 0
 * - 0: 축 위 (x = 0 또는 y = 0)
 *
 * @param v 사분면을 구할 벡터
 */
export function quadrant(v: XYInput): 0 | 1 | 2 | 3 | 4 {
  const x = readX(v);
  const y = readY(v);

  if (x === 0 || y === 0) return 0;
  if (x > 0 && y > 0) return 1;
  if (x < 0 && y > 0) return 2;
  if (x < 0 && y < 0) return 3;
  return 4;
}
