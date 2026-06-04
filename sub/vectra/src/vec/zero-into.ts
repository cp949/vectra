import { writeXY } from '../internal/xy';
import type { XYWritable } from '../types';

/**
 * out에 (0, 0)을 기록하고 out을 반환한다.
 *
 * @param out 결과를 기록할 writable output
 */
export function zeroInto<Out extends XYWritable>(out: Out): Out {
  return writeXY(out, 0, 0);
}
