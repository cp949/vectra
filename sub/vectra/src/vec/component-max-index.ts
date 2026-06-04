import { readX, readY } from '../internal/xy';
import type { XYInput } from '../types';

/**
 * 더 큰 성분의 인덱스를 반환한다.
 *
 * x는 0, y는 1로 본다. componentMax와 같은 Math.max 기준이라
 * input[반환 인덱스]는 componentMax(input)과 일치한다. 두 성분이 같은 값이면
 * x(0)를 우선한다. signed-zero는 Math.max(+0, -0) = +0 기준으로 구분하고,
 * NaN 성분이 있으면 Math.max가 NaN을 만드는 성분을 따르고, 양쪽 NaN이면 x(0)다.
 *
 * @param input 검사할 좌표
 */
export function componentMaxIndex(input: XYInput): 0 | 1 {
  const x = readX(input);
  const y = readY(input);
  return Object.is(Math.max(x, y), x) ? 0 : 1;
}
