import { readX, readY, writeXY } from '../internal/xy';
import type { XYInput, XYWritable } from '../types';

/**
 * input의 각 성분을 올림하여 out에 기록하고 out을 반환한다.
 *
 * input과 out이 같은 object여도 안전하다.
 * NaN, Infinity, -Infinity 입력은 그대로 통과된다.
 *
 * @param out 결과를 기록할 writable output
 * @param input 올림할 입력 벡터
 */
export function ceilInto<Out extends XYWritable>(out: Out, input: XYInput): Out {
  return writeXY(out, Math.ceil(readX(input)), Math.ceil(readY(input)));
}
