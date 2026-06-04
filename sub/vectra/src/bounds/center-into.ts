import { readBoundsMax, readBoundsMin } from '../internal/bounds';
import { readX, readY, writeXY } from '../internal/xy';
import type { BoundsLike, XYWritable } from '../types';

/**
 * bounds의 중심점을 out에 기록하고 out을 반환한다.
 *
 * inverted bounds도 min/max의 산술 중점으로 계산한다. input과 out이 같은 object여도 안전하다.
 *
 * @param out 중심점을 기록할 writable output
 * @param bounds 중심점을 계산할 bounds
 */
export function centerInto<Out extends XYWritable>(out: Out, bounds: BoundsLike): Out {
  // aliasing 안전 - 모든 입력을 먼저 읽은 후 기록한다
  const cx = (readX(readBoundsMin(bounds)) + readX(readBoundsMax(bounds))) / 2;
  const cy = (readY(readBoundsMin(bounds)) + readY(readBoundsMax(bounds))) / 2;
  return writeXY(out, cx, cy);
}
