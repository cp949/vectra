import { readBoundsMax, readBoundsMin } from '../internal/bounds';
import { readX, readY, writeXY } from '../internal/xy';
import type { BoundsLike, BoundsWritable, XYInput } from '../types';

/**
 * bounds를 offset만큼 평행 이동한 결과를 out에 기록한다.
 *
 * empty sentinel bounds에 finite offset을 더하면 sentinel 상태가 유지된다. input과 out이 같은
 * object여도 안전하다.
 *
 * @param out 이동된 bounds를 기록할 writable output
 * @param bounds 이동할 bounds
 * @param offset min과 max에 더할 이동 벡터
 */
export function translateInto<Out extends BoundsWritable>(out: Out, bounds: BoundsLike, offset: XYInput): Out {
  // aliasing 안전 - 모든 입력을 먼저 읽은 후 기록한다
  const minX = readX(readBoundsMin(bounds)) + readX(offset);
  const minY = readY(readBoundsMin(bounds)) + readY(offset);
  const maxX = readX(readBoundsMax(bounds)) + readX(offset);
  const maxY = readY(readBoundsMax(bounds)) + readY(offset);
  writeXY(out.min, minX, minY);
  writeXY(out.max, maxX, maxY);
  return out;
}
