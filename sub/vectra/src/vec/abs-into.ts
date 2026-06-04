import { readX, readY, writeXY } from '../internal/xy';
import type { XYInput, XYWritable } from '../types';

/**
 * input의 각 성분의 절댓값으로 구성된 벡터를 out에 기록하고 out을 반환한다.
 *
 * input과 out이 같은 object여도 안전하다.
 *
 * @param out 결과를 기록할 writable output
 * @param input 절댓값을 취할 입력 벡터
 */
export function absInto<Out extends XYWritable>(out: Out, input: XYInput): Out {
  return writeXY(out, Math.abs(readX(input)), Math.abs(readY(input)));
}
