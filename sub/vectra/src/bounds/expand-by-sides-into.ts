import { readBoundsMax, readBoundsMin } from '../internal/bounds';
import { readX, readY, writeXY } from '../internal/xy';
import type { BoundsLike, BoundsPaddingLike, BoundsWritable } from '../types';

/**
 * bounds를 top/right/bottom/left 개별 양만큼 확장한 결과를 out에 기록한다.
 *
 * min.x -= left, min.y -= top, max.x += right, max.y += bottom.
 * 누락 field는 0으로 처리한다. 음수 값은 deflate로 동작하며 결과가 inverted이면 empty bounds가 된다.
 * sentinel/empty bounds에도 raw 산식을 그대로 적용한다.
 *
 * out === bounds여도 안전하다.
 *
 * @param out 확장된 bounds를 기록할 writable output
 * @param bounds 확장할 기준 bounds
 * @param padding 각 방향 확장량. 미지정 field는 0
 */
export function expandBySidesInto<Out extends BoundsWritable>(
  out: Out,
  bounds: BoundsLike,
  padding: BoundsPaddingLike
): Out {
  // aliasing 안전 - 모든 입력을 먼저 읽은 후 기록한다
  const minX = readX(readBoundsMin(bounds));
  const minY = readY(readBoundsMin(bounds));
  const maxX = readX(readBoundsMax(bounds));
  const maxY = readY(readBoundsMax(bounds));
  const top = padding.top ?? 0;
  const right = padding.right ?? 0;
  const bottom = padding.bottom ?? 0;
  const left = padding.left ?? 0;
  writeXY(out.min, minX - left, minY - top);
  writeXY(out.max, maxX + right, maxY + bottom);
  return out;
}
