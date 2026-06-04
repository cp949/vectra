import { readX, readY, writeXY } from '../internal/xy';
import type { XYInput, XYWritable } from '../types';

/**
 * input 벡터를 정규화하여 out에 기록하고 out을 반환한다.
 *
 * zero vector 입력에서는 throw하지 않고 (0, 0)을 기록한다.
 * input과 out이 같은 object여도 안전하다.
 *
 * @param out 결과를 기록할 writable output
 * @param input 정규화할 입력 벡터
 */
export function normalizeInto<Out extends XYWritable>(out: Out, input: XYInput): Out {
  const x = readX(input);
  const y = readY(input);
  const len = Math.hypot(x, y);

  return len === 0 ? writeXY(out, 0, 0) : writeXY(out, x / len, y / len);
}
