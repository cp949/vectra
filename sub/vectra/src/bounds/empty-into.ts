import { writeXY } from '../internal/xy';
import type { BoundsWritable } from '../types';

/**
 * out을 inverted sentinel empty bounds로 초기화한다.
 *
 * min은 (Infinity, Infinity), max는 (-Infinity, -Infinity)로 기록한다.
 *
 * @param out empty bounds를 기록할 writable output
 */
export function emptyInto<Out extends BoundsWritable>(out: Out): Out {
  writeXY(out.min, Infinity, Infinity);
  writeXY(out.max, -Infinity, -Infinity);
  return out;
}
