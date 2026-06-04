import { readBoundsMax, readBoundsMin } from '../internal/bounds';
import { readX, readY, writeXY } from '../internal/xy';
import type { BoundsLike, CircleWritable, XYWritable } from '../types';

/**
 * bounds에 내접하는 circle을 out에 기록하고 out을 반환한다.
 *
 * radius는 min(width, height) / 2이다. empty bounds는 radius 0을 기록하고 center에 min corner를
 * 그대로 전파한다.
 *
 * @param out circle을 기록할 writable output
 * @param bounds 내접 circle을 계산할 bounds
 */
export function fromBoundsInto<Out extends CircleWritable<XYWritable>>(out: Out, bounds: BoundsLike): Out {
  const minX = readX(readBoundsMin(bounds));
  const minY = readY(readBoundsMin(bounds));
  const maxX = readX(readBoundsMax(bounds));
  const maxY = readY(readBoundsMax(bounds));

  // empty bounds: sentinel 좌표 전파, radius = 0
  if (maxX < minX || maxY < minY) {
    writeXY(out.center, minX, minY);
    out.radius = 0;
    return out;
  }

  const w = maxX - minX;
  const h = maxY - minY;
  writeXY(out.center, minX + w * 0.5, minY + h * 0.5);
  out.radius = (w < h ? w : h) * 0.5;
  return out;
}
