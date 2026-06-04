import { readBoundsMax, readBoundsMin } from '../internal/bounds';
import { readX, readY } from '../internal/xy';
import type { BoundsLike, RectWritable } from '../types';

/**
 * bounds extent를 rect component로 변환해 out에 기록한다.
 *
 * `x=min.x`, `y=min.y`, `width=max.x-min.x`, `height=max.y-min.y`를 기록한다.
 * out과 bounds가 같은 storage를 공유해도 안전하다.
 *
 * @param out 변환 결과 rect를 기록할 writable output
 * @param bounds rect로 변환할 bounds
 */
export function fromBoundsInto<Out extends RectWritable>(out: Out, bounds: BoundsLike): Out {
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
