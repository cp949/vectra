import { readBoundsMax, readBoundsMin } from '../internal/bounds';
import { readX, readY, writeXY } from '../internal/xy';
import type { BoundsLike, BoundsWritable } from '../types';

/**
 * bounds를 모든 방향으로 amount만큼 확장한 결과를 out에 기록한다.
 *
 * 음수 amount는 bounds를 안쪽으로 축소하며, 결과가 inverted bounds가 될 수 있다.
 * input과 out이 같은 object여도 안전하다.
 *
 * @param out 확장된 bounds를 기록할 writable output
 * @param bounds 확장할 기준 bounds
 * @param amount min에서는 빼고 max에는 더할 확장량
 */
export function expandByInto<Out extends BoundsWritable>(out: Out, bounds: BoundsLike, amount: number): Out {
  // aliasing 안전 - 모든 입력을 먼저 읽은 후 기록한다
  const minX = readX(readBoundsMin(bounds)) - amount;
  const minY = readY(readBoundsMin(bounds)) - amount;
  const maxX = readX(readBoundsMax(bounds)) + amount;
  const maxY = readY(readBoundsMax(bounds)) + amount;
  writeXY(out.min, minX, minY);
  writeXY(out.max, maxX, maxY);
  return out;
}
