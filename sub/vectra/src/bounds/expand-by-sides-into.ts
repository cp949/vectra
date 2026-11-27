import type { Bounds, BoundsPadding, BoundsWritable } from '../types/flat-shapes.internal';

/**
 * bounds를 top/right/bottom/left 개별 양만큼 확장한 결과를 out에 기록한다.
 *
 * minX -= left, minY -= top, maxX += right, maxY += bottom.
 * 음수 값은 deflate로 동작하며 결과가 inverted이면 empty bounds가 된다.
 * sentinel/empty bounds에도 raw 산식을 그대로 적용한다.
 *
 * out === bounds여도 안전하다.
 *
 * @param out 결과를 기록할 경계 상자 객체
 * @param bounds 확장할 기준 bounds
 * @param padding 각 방향 확장량. 네 필드 모두 필수다.
 */
export function expandBySidesInto<Out extends BoundsWritable>(out: Out, bounds: Bounds, padding: BoundsPadding): Out {
  // aliasing 안전 - 모든 입력을 먼저 읽은 후 기록한다
  const minX = bounds.minX;
  const minY = bounds.minY;
  const maxX = bounds.maxX;
  const maxY = bounds.maxY;
  const top = padding.top;
  const right = padding.right;
  const bottom = padding.bottom;
  const left = padding.left;
  out.minX = minX - left;
  out.minY = minY - top;
  out.maxX = maxX + right;
  out.maxY = maxY + bottom;
  return out;
}
