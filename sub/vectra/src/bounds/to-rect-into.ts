import type { Bounds, RectWritable } from '../types/flat-shapes.internal';

/**
 * bounds의 extent를 rect로 변환해 out에 기록한다.
 *
 * min을 x/y로, max - min을 width/height로 기록한다. line/point bounds는 width 또는 height가 0인
 * rect가 되어 rect 기준으로는 empty가 된다.
 *
 * @param out 결과를 기록할 사각형 객체
 * @param bounds rect로 변환할 bounds
 */
export function toRectInto<Out extends RectWritable>(out: Out, bounds: Bounds): Out {
  // aliasing 안전 - 모든 입력을 먼저 읽은 후 기록한다
  const minX = bounds.minX;
  const minY = bounds.minY;
  const maxX = bounds.maxX;
  const maxY = bounds.maxY;
  out.x = minX;
  out.y = minY;
  out.width = maxX - minX;
  out.height = maxY - minY;
  return out;
}
