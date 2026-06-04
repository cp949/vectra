import { readX, readY } from '../internal/xy';
import type { XYInput } from '../types';

/**
 * 더 작은 성분의 인덱스를 반환한다.
 *
 * x는 0, y는 1로 본다. componentMin과 같은 Math.min 기준이라
 * input[반환 인덱스]는 componentMin(input)과 일치한다. 두 성분이 같은 값이면
 * x(0)를 우선한다. signed-zero는 Math.min(+0, -0) = -0 기준으로 구분하고,
 * NaN 성분이 있으면 Math.min이 NaN을 만드는 성분을 따르고, 양쪽 NaN이면 x(0)다.
 *
 * @param input 검사할 좌표
 */
export function componentMinIndex(input: XYInput): 0 | 1 {
  const x = readX(input);
  const y = readY(input);
  return Object.is(Math.min(x, y), x) ? 0 : 1;
}
