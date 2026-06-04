import { readX, readY, writeXY } from '../internal/xy';
import type { XYInput, XYWritable } from '../types';

/**
 * a의 각 성분을 b의 각 성분으로 나눈 나머지를 out에 기록하고 out을 반환한다.
 *
 * out.x = a.x % b.x, out.y = a.y % b.y를 기록한다. 결과 부호는 피제수 a의 부호를 따른다.
 * 피제수가 음수이거나 -0이면 결과 성분이 -0이 될 수 있다. validation은 하지 않는다.
 * b.x 또는 b.y가 0이면 해당 성분은 NaN이 된다. a 또는 b가 NaN/Infinity여도 JavaScript % 결과를 그대로 따른다.
 * a 또는 b가 out과 같은 object여도 안전하다.
 *
 * @param out 결과를 기록할 writable output
 * @param a 피제수 벡터
 * @param b 제수 벡터. 성분이 0이면 NaN이 나온다
 */
export function moduloInto<Out extends XYWritable>(out: Out, a: XYInput, b: XYInput): Out {
  return writeXY(out, readX(a) % readX(b), readY(a) % readY(b));
}
