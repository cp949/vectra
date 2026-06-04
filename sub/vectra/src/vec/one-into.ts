import { writeXY } from '../internal/xy';
import type { XYWritable } from '../types';

/**
 * out에 (1, 1)을 기록하고 out을 반환한다.
 *
 * @param out 결과를 기록할 writable output
 */
export function oneInto<Out extends XYWritable>(out: Out): Out {
  return writeXY(out, 1, 1);
}
