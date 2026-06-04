import { readX, readY, writeXY } from '../internal/xy';
import type { XYInput, XYWritable } from '../types';

/**
 * a의 각 성분을 b의 각 성분으로 나눈 벡터를 out에 기록하고 out을 반환한다.
 *
 * b.x 또는 b.y가 0이면 해당 성분은 Infinity 또는 NaN이 될 수 있다. 유효성 검사 없이 raw division을 수행한다.
 * a 또는 b가 out과 같은 object여도 안전하다.
 *
 * @param out 결과를 기록할 writable output
 * @param a 피제수 벡터
 * @param b 제수 벡터. 성분이 0이면 Infinity 또는 NaN이 나올 수 있다
 */
export function divideInto<Out extends XYWritable>(out: Out, a: XYInput, b: XYInput): Out {
  return writeXY(out, readX(a) / readX(b), readY(a) / readY(b));
}
