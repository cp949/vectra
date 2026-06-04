import { readBoundsMax, readBoundsMin } from '../internal/bounds';
import { readX, readY, writeXY } from '../internal/xy';
import type { BoundsLike, BoundsWritable, XYInput, XYWritable } from '../types';

/**
 * bounds의 min/max 좌표를 out에 복사하고 out을 반환한다.
 *
 * input과 out이 같은 object여도 안전하다.
 *
 * @param out bounds 좌표를 기록할 writable output
 * @param bounds 복사할 bounds 또는 min 좌표
 * @param max max 좌표
 */
export function copyInto<Out extends BoundsWritable<XYWritable, XYWritable>>(out: Out, bounds: BoundsLike): Out;
export function copyInto<Out extends BoundsWritable<XYWritable, XYWritable>>(out: Out, min: XYInput, max: XYInput): Out;
export function copyInto<Out extends BoundsWritable<XYWritable, XYWritable>>(
  out: Out,
  boundsOrMin: BoundsLike | XYInput,
  max?: XYInput
): Out {
  // aliasing 안전 - 모든 입력을 먼저 읽은 후 기록한다
  const min = max === undefined ? readBoundsMin(boundsOrMin as BoundsLike) : (boundsOrMin as XYInput);
  const maxPoint = max === undefined ? readBoundsMax(boundsOrMin as BoundsLike) : max;
  const minX = readX(min);
  const minY = readY(min);
  const maxX = readX(maxPoint);
  const maxY = readY(maxPoint);
  writeXY(out.min, minX, minY);
  writeXY(out.max, maxX, maxY);
  return out;
}
