import { readBoundsMax, readBoundsMin } from '../internal/bounds';
import { readX, readY, writeXY } from '../internal/xy';
import type { BoundsLike, BoundsWritable } from '../types';

/**
 * bounds와 other를 모두 포함하는 bounds를 out에 기록한다.
 *
 * min/max의 raw 자연식을 적용하며 inverted bounds를 별도로 정규화하지 않는다.
 * input과 out이 같은 object여도 안전하다.
 *
 * @param out 확장된 bounds를 기록할 writable output
 * @param bounds 확장할 기준 bounds
 * @param other 포함시킬 대상 bounds
 */
export function expandToIncludeBoundsInto<Out extends BoundsWritable>(
  out: Out,
  bounds: BoundsLike,
  other: BoundsLike
): Out {
  // aliasing 안전 - 모든 입력을 먼저 읽은 후 기록한다
  // raw 자연식을 그대로 적용한다 (inverted bounds 정규화 없음)
  const bMinX = readX(readBoundsMin(bounds));
  const bMinY = readY(readBoundsMin(bounds));
  const bMaxX = readX(readBoundsMax(bounds));
  const bMaxY = readY(readBoundsMax(bounds));
  const oMinX = readX(readBoundsMin(other));
  const oMinY = readY(readBoundsMin(other));
  const oMaxX = readX(readBoundsMax(other));
  const oMaxY = readY(readBoundsMax(other));
  const newMinX = bMinX < oMinX ? bMinX : oMinX;
  const newMinY = bMinY < oMinY ? bMinY : oMinY;
  const newMaxX = bMaxX > oMaxX ? bMaxX : oMaxX;
  const newMaxY = bMaxY > oMaxY ? bMaxY : oMaxY;
  writeXY(out.min, newMinX, newMinY);
  writeXY(out.max, newMaxX, newMaxY);
  return out;
}
