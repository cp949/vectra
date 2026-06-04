import type { XYInput, XYObjectWritable } from '../types';
import { moduloInto } from './modulo-into';

/**
 * a의 각 성분을 b의 각 성분으로 나눈 나머지를 새 object로 반환한다.
 *
 * { x: a.x % b.x, y: a.y % b.y }를 새로 만들어 반환한다. 결과 부호는 피제수 a의 부호를 따른다.
 * 피제수가 음수이거나 -0이면 결과 성분이 -0이 될 수 있다. validation은 하지 않는다.
 * b.x 또는 b.y가 0이면 해당 성분은 NaN이 된다. a 또는 b가 NaN/Infinity여도 JavaScript % 결과를 그대로 따른다.
 *
 * @param a 피제수 벡터
 * @param b 제수 벡터. 성분이 0이면 NaN이 나온다
 */
export function modulo(a: XYInput, b: XYInput): XYObjectWritable {
  return moduloInto({ x: 0, y: 0 }, a, b);
}
