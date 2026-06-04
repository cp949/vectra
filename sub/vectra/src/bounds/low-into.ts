import { readBoundsMin } from '../internal/bounds';
import { readX, readY, writeXY } from '../internal/xy';
import type { BoundsLike, XYWritable } from '../types';

/**
 * bounds의 low point인 min 좌표를 out에 기록하고 out을 반환한다.
 *
 * empty/sentinel bounds에서도 raw min 좌표를 그대로 기록한다. input과 out이 같은 object여도 안전하다.
 *
 * @param out min 좌표를 기록할 writable output
 * @param bounds min 좌표를 읽을 bounds
 */
export function lowInto<Out extends XYWritable>(out: Out, bounds: BoundsLike): Out {
  // aliasing 안전 - 모든 입력을 먼저 읽은 후 기록한다
  const x = readX(readBoundsMin(bounds));
  const y = readY(readBoundsMin(bounds));
  return writeXY(out, x, y);
}
