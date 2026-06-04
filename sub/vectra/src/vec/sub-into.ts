import { readX, readY, writeXY } from '../internal/xy';
import type { XYInput, XYWritable } from '../types';

/**
 * a에서 b를 뺀 벡터를 out에 기록하고 out을 반환한다.
 *
 * a 또는 b가 out과 같은 object여도 안전하다.
 *
 * @param out 결과를 기록할 writable output
 * @param a 피감산 벡터
 * @param b 감산 벡터
 */
export function subInto<Out extends XYWritable>(out: Out, a: XYInput, b: XYInput): Out {
  return writeXY(out, readX(a) - readX(b), readY(a) - readY(b));
}
