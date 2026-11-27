import type { BoundsWritable, Rect } from '../types/flat-shapes.internal';

/**
 * rect의 extent를 bounds로 변환해 out에 기록한다.
 *
 * `minX = x`, `minY = y`, `maxX = x + width`, `maxY = y + height`를 기록한다. line/point rect는
 * line/point bounds가 되어 bounds 기준으로는 non-empty가 된다.
 *
 * @param out 결과를 기록할 경계 상자 객체
 * @param rect bounds로 변환할 rect
 */
export function fromRectInto<Out extends BoundsWritable>(out: Out, rect: Rect): Out {
  // aliasing 안전 - 모든 입력을 먼저 읽은 후 기록한다
  const x = rect.x;
  const y = rect.y;
  const w = rect.width;
  const h = rect.height;
  out.minX = x;
  out.minY = y;
  out.maxX = x + w;
  out.maxY = y + h;
  return out;
}
