import { readX, readY } from '../internal/xy';
import type { XYInput } from '../types';

/**
 * 좌표가 지정한 사분면에 속하는지 판정한다.
 *
 * 사분면 번호는 quadrant와 동일한 수학 관례를 따른다(1: x>0,y>0 / 2: x<0,y>0 /
 * 3: x<0,y<0 / 4: x>0,y<0). x 또는 y가 0이면(축 위) 0이다. isInQuadrant(input, 0)은
 * 축 위 점에서 true다. runtime validation은 하지 않는다.
 *
 * @param input 검사할 좌표
 * @param quadrant 비교할 사분면 번호
 */
export function isInQuadrant(input: XYInput, quadrant: 0 | 1 | 2 | 3 | 4): boolean {
  const x = readX(input);
  const y = readY(input);

  let actual: 0 | 1 | 2 | 3 | 4;
  if (x === 0 || y === 0) actual = 0;
  else if (x > 0 && y > 0) actual = 1;
  else if (x < 0 && y > 0) actual = 2;
  else if (x < 0 && y < 0) actual = 3;
  else actual = 4;

  return actual === quadrant;
}
