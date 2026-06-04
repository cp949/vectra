import { readBoundsMax, readBoundsMin } from '../internal/bounds';
import { readX, readY, writeXY } from '../internal/xy';
import type { BoundsLike, BoundsWritable, XYInput } from '../types';

/**
 * bounds와 point를 모두 포함하는 bounds를 out에 기록한다.
 *
 * min/max의 raw 자연식을 적용하며 inverted bounds를 별도로 정규화하지 않는다.
 * input과 out이 같은 object여도 안전하다.
 *
 * @param out 확장된 bounds를 기록할 writable output
 * @param bounds 확장할 기준 bounds
 * @param point 포함시킬 point
 */
export function expandToIncludePointInto<Out extends BoundsWritable>(
  out: Out,
  bounds: BoundsLike,
  point: XYInput
): Out {
  // aliasing 안전 - 모든 입력을 먼저 읽은 후 기록한다
  const bMinX = readX(readBoundsMin(bounds));
  const bMinY = readY(readBoundsMin(bounds));
  const bMaxX = readX(readBoundsMax(bounds));
  const bMaxY = readY(readBoundsMax(bounds));
  const px = readX(point);
  const py = readY(point);
  const newMinX = bMinX < px ? bMinX : px;
  const newMinY = bMinY < py ? bMinY : py;
  const newMaxX = bMaxX > px ? bMaxX : px;
  const newMaxY = bMaxY > py ? bMaxY : py;
  writeXY(out.min, newMinX, newMinY);
  writeXY(out.max, newMaxX, newMaxY);
  return out;
}
