import { readBoundsMax, readBoundsMin } from '../internal/bounds';
import { readX, readY } from '../internal/xy';
import type { BoundsLike, RectWritable } from '../types';

/**
 * bounds의 extent를 rect로 변환해 out에 기록한다.
 *
 * min을 x/y로, max - min을 width/height로 기록한다. line/point bounds는 width 또는 height가 0인
 * rect가 되어 rect 기준으로는 empty가 된다.
 *
 * @param out 변환된 rect를 기록할 writable output
 * @param bounds rect로 변환할 bounds
 */
export function toRectInto<Out extends RectWritable>(out: Out, bounds: BoundsLike): Out {
  // aliasing 안전 - 모든 입력을 먼저 읽은 후 기록한다
  const minX = readX(readBoundsMin(bounds));
  const minY = readY(readBoundsMin(bounds));
  const maxX = readX(readBoundsMax(bounds));
  const maxY = readY(readBoundsMax(bounds));
  out.x = minX;
  out.y = minY;
  out.width = maxX - minX;
  out.height = maxY - minY;
  return out;
}
